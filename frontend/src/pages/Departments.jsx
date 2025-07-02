import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Trash2, RotateCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function Departments() {
  const navigate = useNavigate();
  const { invalidateDepartmentCache } = useDataContext();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    departmentId: null,
    departmentName: ''
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [adding, setAdding] = useState(false);

  // Use data manager for departments
  const { 
    data: departmentsData = [],
    loading,
    error,
    updateData: updateDepartments,
    refetch: refetchDepartments
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Use data manager for students to count students per department
  const { 
    data: studentsData = [],
    refetch: refetchStudents
  } = useDataManager('/students', {
    cacheKey: 'students'
  });

  // Ensure departments is always an array
  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const students = Array.isArray(studentsData) ? studentsData : [];

  // Count students per department
  const getStudentCount = (departmentId) => {
    return students.filter(student => {
      // Handle both populated department object and department ID string
      const studentDeptId = student.department?._id || student.department;
      return studentDeptId?.toString() === departmentId.toString();
    }).length;
  };

  const handleDepartmentClick = (departmentId) => {
    navigate(`/departments/${departmentId}`);
  };

  const handleDeleteDepartment = (departmentId, departmentName) => {
    setConfirmDelete({
      isOpen: true,
      departmentId,
      departmentName
    });
  };

  const handleDeleteConfirm = async () => {
    const { departmentId } = confirmDelete;
    
    setDeleting(true);
    try {
      await api.delete(`/departments/${departmentId}`);
      
      // Update local state
      updateDepartments(prevDepartments => 
        prevDepartments.filter(dept => dept._id !== departmentId)
      );
      
      toast.success('Department deleted successfully');
      
      // Invalidate related caches
      invalidateDepartmentCache();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error.response?.data?.error || 'Failed to delete department');
    } finally {
      setDeleting(false);
      setConfirmDelete({ isOpen: false, departmentId: null, departmentName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ isOpen: false, departmentId: null, departmentName: '' });
  };

  // Add department submit handler
  const handleAddDepartmentSubmit = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setAdding(true);
    try {
      const res = await api.post('/departments', { name: newDeptName });
      updateDepartments(prev => [...prev, res.data]);
      setNewDeptName('');
      setIsAddModalOpen(false);
      toast.success('Department added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add department');
    } finally {
      setAdding(false);
    }
  };

  const handleRefresh = () => {
    if (typeof refetchDepartments === 'function') refetchDepartments();
    if (typeof refetchStudents === 'function') refetchStudents();
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading departments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error loading departments: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            Departments
          </h1>
          <p className="text-muted-foreground">
            Manage and view department information and students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Departments Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first department
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => {
            const studentCount = getStudentCount(department._id);
            
            return (
              <Card 
                key={department._id}
                className="relative hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => handleDepartmentClick(department._id)}
                    >
                      <Building2 className="w-5 h-5 text-blue-600" />
                      {department.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{studentCount} students enrolled</span>
                    </div>
                    
                    {studentCount === 0 && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        No students assigned to this department yet
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Click department name to view details
                    </div>
                  </div>
                </CardContent>
                
                {/* Delete Button */}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDepartment(department._id, department.name);
                    }}
                    disabled={deleting}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
                <div className="text-sm text-muted-foreground">Total Departments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{students.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {departments.length > 0 ? Math.round(students.length / departments.length) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg Students per Department</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${confirmDelete.departmentName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepartmentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deptName" className="block">Department Name</Label>
              <Input
                id="deptName"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                placeholder="Enter department name"
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add Department'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 