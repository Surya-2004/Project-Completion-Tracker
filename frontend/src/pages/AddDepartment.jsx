"use client"

import { useState } from "react"
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
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';

// Lucide React Icons as components
const PlusIcon = ({ className = "w-5 h-5" }) => <Plus className={className} />

const UsersIcon = ({ className = "w-5 h-5" }) => <Users className={className} />

const UserCheckIcon = ({ className = "w-5 h-5" }) => <UserCheck className={className} />

const TrashIcon = ({ className = "w-5 h-5" }) => <Trash2 className={className} />

export default function AddDepartment() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    departmentId: null,
    departmentName: "",
    errorMessage: null,
  })
  const navigate = useNavigate()

  const { invalidateDepartmentCache } = useDataContext();

  // Use data manager for departments
  const { 
    data: departmentsData = [], 
    updateData: updateDepartments 
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Ensure departments is always an array
  const departments = Array.isArray(departmentsData) ? departmentsData : [];

  // Use data manager for student counts
  const { 
    data: studentsData = []
  } = useDataManager('/students', {
    cacheKey: 'students'
  });

  // Ensure students is always an array
  const students = Array.isArray(studentsData) ? studentsData : [];

  // Use data manager for team counts
  const { 
    data: teamCounts = {}
  } = useDataManager('/departments/team-counts', {
    cacheKey: 'team-counts'
  });

  // Calculate student counts from students data
  const studentCounts = Array.isArray(students) ? students.reduce((counts, stu) => {
    if (stu.department) {
      const deptId = typeof stu.department === 'object' ? stu.department._id : stu.department
      counts[deptId] = (counts[deptId] || 0) + 1
    }
    return counts
  }, {}) : {};

  // Ensure studentCounts and teamCounts are always objects
  const safeStudentCounts = studentCounts || {};
  const safeTeamCounts = teamCounts || {};

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a department name")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/departments", { name: name.trim() })
      
      // Update local state immediately
      updateDepartments(prevDepartments => [...prevDepartments, response.data]);
      
      toast.success("Department added successfully!")
      setName("")
      
      // Invalidate related caches
      invalidateDepartmentCache();
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
      
      // Update local state immediately
      updateDepartments(prevDepartments => 
        prevDepartments.filter(dep => dep._id !== departmentId)
      );
      
      toast.success("Department deleted successfully!")
      
      // Invalidate related caches
      invalidateDepartmentCache();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to delete department"
      setConfirmDialog(prev => ({ ...prev, errorMessage }))
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
      setConfirmDialog({ isOpen: false, departmentId: null, departmentName: "", errorMessage: null })
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, departmentId: null, departmentName: "", errorMessage: null })
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">Department Management</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departmentName" className="text-sm font-medium">Department Name *</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="departmentName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter department name"
                    className="flex-1"
                    required
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !name.trim()} 
                    className="px-6 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <PlusIcon className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Department
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-6">Existing Departments</h3>
            <div className="grid gap-4">
              {departments.map((department) => (
                <Card key={department._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{department.name}</h4>
                          <Badge variant="outline">
                            <UsersIcon className="w-3 h-3 mr-1" />
                            {safeStudentCounts[department._id] || 0} Students
                          </Badge>
                          <Badge variant="secondary">
                            <UserCheckIcon className="w-3 h-3 mr-1" />
                            {safeTeamCounts[department._id] || 0} Teams
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/departments/${department._id}/students`)}
                          className="flex items-center gap-1"
                        >
                          <UsersIcon className="w-3 h-3" />
                          View Students
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, department._id, department.name)}
                          disabled={deleting}
                          className="flex items-center gap-1"
                        >
                          <TrashIcon className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {departments.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-muted-foreground mb-2">No departments found</h4>
                <p className="text-sm text-muted-foreground">Add your first department using the form above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog.isOpen} onOpenChange={handleDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{confirmDialog.departmentName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {confirmDialog.errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{confirmDialog.errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
