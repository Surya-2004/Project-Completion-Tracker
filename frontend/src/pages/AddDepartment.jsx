"use client"

import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Users, UserCheck, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Lucide React Icons as components
const PlusIcon = ({ className = "w-5 h-5" }) => <Plus className={className} />

const UsersIcon = ({ className = "w-5 h-5" }) => <Users className={className} />

const UserCheckIcon = ({ className = "w-5 h-5" }) => <UserCheck className={className} />

const TrashIcon = ({ className = "w-5 h-5" }) => <Trash2 className={className} />

export default function AddDepartment() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [studentCounts, setStudentCounts] = useState({})
  const [teamCounts, setTeamCounts] = useState({})
  const [deleting, setDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    departmentId: null,
    departmentName: "",
    errorMessage: null,
  })
  const navigate = useNavigate()

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments")
      setDepartments(res.data)
    } catch (error) {
      setDepartments([])
      toast.error("Failed to fetch departments")
      console.error("Error fetching departments:", error)
    }
  }

  const fetchStudentCounts = async () => {
    try {
      const res = await api.get("/students")
      const counts = {}
      res.data.forEach((stu) => {
        if (stu.department) {
          const deptId = typeof stu.department === 'object' ? stu.department._id : stu.department
          counts[deptId] = (counts[deptId] || 0) + 1
        }
      })
      setStudentCounts(counts)
    } catch (error) {
      setStudentCounts({})
      console.error("Error fetching student counts:", error)
    }
  }

  const fetchTeamCounts = async () => {
    try {
      const res = await api.get("/departments/team-counts")
      setTeamCounts(res.data)
    } catch (error) {
      setTeamCounts({})
      console.error("Error fetching team counts:", error)
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchStudentCounts()
    fetchTeamCounts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a department name")
      return
    }

    setLoading(true)
    try {
      await api.post("/departments", { name: name.trim() })
      toast.success("Department added successfully!")
      setName("")
      await Promise.all([fetchDepartments(), fetchStudentCounts(), fetchTeamCounts()])
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add department")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (e, departmentId, departmentName) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDialog({
      isOpen: true,
      departmentId,
      departmentName: departmentName || "Unnamed Department",
      errorMessage: null,
    })
  }

  const handleDeleteConfirm = async () => {
    const { departmentId } = confirmDialog
    if (!departmentId) return

    setDeleting(true)
    try {
      await api.delete(`/departments/${departmentId}`)
      setDepartments((prev) => prev.filter((d) => d._id !== departmentId))
      toast.success("Department deleted successfully")
      await Promise.all([fetchStudentCounts(), fetchTeamCounts()])
      setConfirmDialog({ isOpen: false, departmentId: null, departmentName: "", errorMessage: null })
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Failed to delete department"
      
      if (err.response?.data?.message) {
        // Show error dialog for department with students
        setConfirmDialog(prev => ({
          ...prev,
          isOpen: false,
          errorMessage: message
        }))
      } else {
        // Show toast for other errors
        toast.error(message)
        setConfirmDialog({ isOpen: false, departmentId: null, departmentName: "", errorMessage: null })
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, departmentId: null, departmentName: "", errorMessage: null })
  }

  const handleCardClick = (departmentId) => {
    navigate(`/departments/${departmentId}/students`)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage your organization's departments</p>
        </div>

        {/* Add Department Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              <CardTitle>Add New Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="departmentName">Department Name</Label>
                <Input
                  id="departmentName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                >
                  {loading ? "Adding..." : "Add Department"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">All Departments</h2>

          {departments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No departments found</p>
                <p className="text-sm text-muted-foreground">Add your first department to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <Card
                  key={department._id}
                  className="relative group cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => handleCardClick(department._id)}
                >
                  <CardContent className="p-6">
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, department._id, department.name)}
                      disabled={deleting}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Department"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>

                    {/* Department Content */}
                    <div className="space-y-4 pr-8">
                      <h3 className="font-semibold text-lg leading-tight">
                        {department.name || <span className="text-muted-foreground italic">Unnamed Department</span>}
                      </h3>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {studentCounts[department._id] || 0} student{studentCounts[department._id] === 1 ? "" : "s"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheckIcon className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline">
                            {teamCounts[department._id] || 0} team{teamCounts[department._id] === 1 ? "" : "s"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={confirmDialog.isOpen} onOpenChange={handleDeleteCancel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Department</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{confirmDialog.departmentName}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog for Department with Students */}
        <Dialog open={!!confirmDialog.errorMessage} onOpenChange={handleDeleteCancel}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <DialogTitle>Cannot Delete Department</DialogTitle>
              </div>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertDescription>
                {confirmDialog.errorMessage}
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={handleDeleteCancel}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
