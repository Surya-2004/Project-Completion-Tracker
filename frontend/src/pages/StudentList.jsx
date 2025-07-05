import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';

export default function StudentList() {
  const { id } = useParams(); // department id
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'resume' or 'email'
  const [resumeInput, setResumeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '', // 'single' or 'bulk'
    studentId: null,
    studentCount: 0
  });

  const { invalidateStudentCache } = useDataContext();

  // Use data manager for departments
  const { 
    data: departments = [] 
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Use data manager for students with force refresh on navigation
  const { 
    data: students = [], 
    loading, 
    error, 
    updateData: updateStudents 
  } = useDataManager(`/students?department=${id}`, {
    forceRefresh: true,
    cacheKey: `students-${id}`
  });

  // Ensure arrays are safe
  const studentsArray = Array.isArray(students) ? students : [];
  const departmentsArray = Array.isArray(departments) ? departments : [];
  const selectedStudentsArray = Array.isArray(selectedStudents) ? selectedStudents : [];

  // Find department name
  const department = departmentsArray.find(d => d._id === id);

  const startEdit = (stu, field) => {
    setEditingId(stu._id);
    setEditingField(field);
    if (field === 'resume') {
      setResumeInput(stu.resumeUrl || '');
    } else if (field === 'email') {
      setEmailInput(stu.email || '');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setResumeInput('');
    setEmailInput('');
  };

  const saveField = async () => {
    if (!editingId || !editingField) return;
    
    setSaving(true);
    try {
      const updateData = {};
      if (editingField === 'resume') {
        updateData.resumeUrl = resumeInput;
      } else if (editingField === 'email') {
        updateData.email = emailInput;
      }
      
      await api.patch(`/students/${editingId}`, updateData);
      
      // Update local state immediately
      updateStudents(prevStudents => 
        prevStudents.map(s => 
          s._id === editingId 
            ? { ...s, ...updateData }
            : s
        )
      );
      
      setEditingId(null);
      setEditingField(null);
      setResumeInput('');
      setEmailInput('');
      toast.success(`${editingField === 'resume' ? 'Resume URL' : 'Email'} updated successfully!`);
      
      // Invalidate related caches
      invalidateStudentCache();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to update ${editingField === 'resume' ? 'resume URL' : 'email'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentsArray.length === studentsArray.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsArray.map(s => s._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedStudentsArray.length === 0) {
      toast.error('Please select students to delete');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'bulk',
      studentCount: selectedStudentsArray.length
    });
  };

  const handleDeleteSingle = (studentId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'single',
      studentId
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, studentId } = confirmDialog;
    
    setDeleting(true);
    try {
      if (type === 'single') {
        await api.delete(`/students/${studentId}`);
        // Update local state immediately
        updateStudents(prevStudents => prevStudents.filter(s => s._id !== studentId));
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        toast.success('Student deleted successfully');
      } else if (type === 'bulk') {
        const response = await api.delete('/students', { data: { studentIds: selectedStudentsArray } });
        // Update local state immediately
        updateStudents(prevStudents => prevStudents.filter(s => !selectedStudentsArray.includes(s._id)));
        setSelectedStudents([]);
        toast.success(response.data.message);
      }
      
      // Invalidate related caches
      invalidateStudentCache();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete students');
    } finally {
      setDeleting(false);
      setConfirmDialog({ isOpen: false, type: '', studentId: null, studentCount: 0 });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, type: '', studentId: null, studentCount: 0 });
  };

  const getConfirmMessage = () => {
    const { type, studentCount } = confirmDialog;
    if (type === 'single') {
      return 'Are you sure you want to delete this student?';
    } else if (type === 'bulk') {
      return `Are you sure you want to delete ${studentCount} student(s)?`;
    }
    return '';
  };

  if (loading) return (
    <Card className="max-w-4xl mx-auto p-8 mt-8">
      <CardContent>
        <p className="text-muted-foreground">Loading students...</p>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="max-w-4xl mx-auto p-8 mt-8">
      <CardContent>
        <p className="text-destructive font-medium">{error}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">
            Students - {department?.name || 'Department'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Selection Controls */}
          {studentsArray.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedStudentsArray.length === studentsArray.length && studentsArray.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>
                <span className="text-muted-foreground">
                  {selectedStudentsArray.length} of {studentsArray.length} selected
                </span>
              </div>
              {selectedStudentsArray.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="w-full sm:w-auto"
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedStudentsArray.length} Student(s)`}
                </Button>
              )}
            </div>
          )}

          {studentsArray.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={selectedStudentsArray.length === studentsArray.length && studentsArray.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-center">Name</TableHead>
                    <TableHead className="text-center">Registered Number</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="text-center">Resume</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsArray.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedStudentsArray.includes(student._id)}
                          onCheckedChange={() => handleSelectStudent(student._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-center">{student.name}</TableCell>
                      <TableCell className="text-center">
                        {student.registeredNumber ? (
                          <Badge variant="outline" className="font-mono">{student.registeredNumber}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === student._id && editingField === 'email' ? (
                          <div className="flex gap-2">
                            <Input
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="Enter email address"
                              type="email"
                              className="flex-1"
                            />
                            <Button size="sm" onClick={saveField} disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {student.email ? (
                              <a
                                href={`mailto:${student.email}`}
                                className="text-blue-500 hover:text-blue-400 underline"
                              >
                                {student.email}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                            <Button size="sm" variant="outline" onClick={() => startEdit(student, 'email')}>
                              Edit
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.role ? (
                          <Badge variant="secondary">{student.role}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingId === student._id && editingField === 'resume' ? (
                          <div className="flex gap-2">
                            <Input
                              value={resumeInput}
                              onChange={(e) => setResumeInput(e.target.value)}
                              placeholder="Enter resume URL"
                              className="flex-1"
                            />
                            <Button size="sm" onClick={saveField} disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {student.resumeUrl ? (
                              <a
                                href={student.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 underline"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                            <Button size="sm" variant="outline" onClick={() => startEdit(student, 'resume')}>
                              Edit
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSingle(student._id)}
                          disabled={deleting}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title={confirmDialog.type === 'bulk' ? 'Delete Multiple Students' : 'Delete Student'}
        message={getConfirmMessage()}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
} 