import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, User, Building2, FileText, Hash, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function DepartmentDetail() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
    email: '',
    resumeUrl: '',
    registeredNumber: ''
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    type: '', // 'department', 'student', or 'bulk'
    studentId: null
  });

  useEffect(() => {
    fetchDepartmentData();
  }, [departmentId]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const [deptRes, studentsRes] = await Promise.all([
        api.get(`/departments/${departmentId}`),
        api.get(`/students/department/${departmentId}`)
      ]);
      
      setDepartment(deptRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setEditForm({
      role: student.role || '',
      email: student.email || '',
      resumeUrl: student.resumeUrl || '',
      registeredNumber: student.registeredNumber || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await api.patch(`/students/${editingStudent._id}`, editForm);
      
      // Update the students list with the updated student
      setStudents(students.map(s => 
        s._id === editingStudent._id ? response.data : s
      ));
      
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      toast.success('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.error || 'Failed to update student');
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingStudent(null);
    setEditForm({ role: '', email: '', resumeUrl: '', registeredNumber: '' });
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleDeleteDepartment = () => {
    setConfirmDelete({
      isOpen: true,
      type: 'department',
      studentId: null
    });
  };

  const handleDeleteStudent = (studentId) => {
    setConfirmDelete({
      isOpen: true,
      type: 'student',
      studentId
    });
  };

  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to delete');
      return;
    }

    setConfirmDelete({
      isOpen: true,
      type: 'bulk',
      studentId: null
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, studentId } = confirmDelete;
    
    setDeleting(true);
    try {
      if (type === 'department') {
        await api.delete(`/departments/${departmentId}`);
        toast.success('Department deleted successfully');
        navigate('/departments');
      } else if (type === 'student') {
        await api.delete(`/students/${studentId}`);
        // Update local state
        setStudents(students.filter(s => s._id !== studentId));
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        toast.success('Student deleted successfully');
      } else if (type === 'bulk') {
        const response = await api.delete('/students', { 
          data: { studentIds: selectedStudents } 
        });
        // Update local state
        setStudents(students.filter(s => !selectedStudents.includes(s._id)));
        setSelectedStudents([]);
        toast.success(response.data.message || `${selectedStudents.length} students deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
      setConfirmDelete({ isOpen: false, type: '', studentId: null });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ isOpen: false, type: '', studentId: null });
  };

  const getConfirmMessage = () => {
    const { type } = confirmDelete;
    if (type === 'department') {
      return `Are you sure you want to delete the department "${department?.name}"? This action cannot be undone.`;
    } else if (type === 'student') {
      const student = students.find(s => s._id === confirmDelete.studentId);
      return `Are you sure you want to delete student "${student?.name}"? This action cannot be undone.`;
    } else if (type === 'bulk') {
      return `Are you sure you want to delete ${selectedStudents.length} student(s)? This action cannot be undone.`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading department data...</div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Department not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/departments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Departments
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Department details and student management
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleDeleteDepartment}
          disabled={deleting}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Department
        </Button>
      </div>

      {/* Department Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Department Name</Label>
              <p className="text-lg font-semibold">{department.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Students</Label>
              <p className="text-lg font-semibold">{students.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Students ({students.length})
            </CardTitle>
            <Button 
              onClick={() => navigate(`/departments/${departmentId}/add-student`)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found in this department
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selection Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label>Select All</Label>
                  </div>
                  <span className="text-muted-foreground">
                    {selectedStudents.length} of {students.length} selected
                  </span>
                </div>
                {selectedStudents.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="w-full sm:w-auto"
                  >
                    {deleting ? 'Deleting...' : `Delete ${selectedStudents.length} Student(s)`}
                  </Button>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Registered Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedStudents.includes(student._id)}
                          onCheckedChange={() => handleSelectStudent(student._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        {student.registeredNumber ? (
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono">{student.registeredNumber}</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.email ? (
                          <a
                            href={`mailto:${student.email}`}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {student.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.role || (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.teamId ? (
                          <div>
                            <div className="font-medium">Team {student.teamId.teamNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {student.teamId.projectTitle}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="outline">No Team</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.resumeUrl ? (
                          <a
                            href={student.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground">No resume</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStudent(student._id)}
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Student: {editingStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registeredNumber">Registered Number</Label>
              <Input
                id="registeredNumber"
                value={editForm.registeredNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, registeredNumber: e.target.value }))}
                placeholder="e.g., REG2024CS001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={editForm.role}
                onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="student@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                type="url"
                value={editForm.resumeUrl}
                onChange={(e) => setEditForm(prev => ({ ...prev, resumeUrl: e.target.value }))}
                placeholder="https://example.com/resume.pdf"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title={confirmDelete.type === 'bulk' ? 'Delete Multiple Students' : confirmDelete.type === 'department' ? 'Delete Department' : 'Delete Student'}
        message={getConfirmMessage()}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
} 