import { useEffect, useState } from 'react';
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

export default function StudentList() {
  const { id } = useParams(); // department id
  const [students, setStudents] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [resumeInput, setResumeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '', // 'single' or 'bulk'
    studentId: null,
    studentCount: 0
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/departments`),
      api.get(`/students?department=${id}`)
    ])
      .then(([depRes, stuRes]) => {
        setDepartment(depRes.data.find(d => d._id === id));
        setStudents(stuRes.data);
      })
      .catch(() => setError('Failed to fetch students or department'))
      .finally(() => setLoading(false));
  }, [id]);

  const startEdit = (stu) => {
    setEditingId(stu._id);
    setResumeInput(stu.resumeUrl || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setResumeInput('');
  };

  const saveResume = async (stu) => {
    setSaving(true);
    try {
      const res = await api.patch(`/students/${stu._id}`, { resumeUrl: resumeInput });
      setStudents(students => students.map(s => s._id === stu._id ? res.data : s));
      toast.success('Resume updated!');
      setEditingId(null);
      setResumeInput('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update resume');
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
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students to delete');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'bulk',
      studentCount: selectedStudents.length
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
    const { type, studentId, studentCount } = confirmDialog;
    
    setDeleting(true);
    try {
      if (type === 'single') {
        await api.delete(`/students/${studentId}`);
        setStudents(students => students.filter(s => s._id !== studentId));
        setSelectedStudents(prev => prev.filter(id => id !== studentId));
        toast.success('Student deleted successfully');
      } else if (type === 'bulk') {
        await api.delete('/students', { data: { studentIds: selectedStudents } });
        setStudents(students => students.filter(s => !selectedStudents.includes(s._id)));
        setSelectedStudents([]);
        toast.success(`${studentCount} student(s) deleted successfully`);
      }
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
      return 'Are you sure you want to delete this student? This will also remove them from their team and delete the team if it becomes empty.';
    } else if (type === 'bulk') {
      return `Are you sure you want to delete ${studentCount} student(s)? This will also remove them from their teams and delete any empty teams.`;
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">
            {department ? `${department.name} Department` : 'Department'} - Students
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-4">
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
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedStudents.length} Student(s)`}
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading students...</div>
          ) : error ? (
            <div className="text-destructive font-medium text-center py-8">{error}</div>
          ) : students.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Team #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student._id)}
                          onCheckedChange={() => handleSelectStudent(student._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.name || 'Unnamed'}</TableCell>
                      <TableCell>
                        {student.teamId ? (
                          <Link to={`/teams/${student.teamId._id}`}>
                            <Badge variant="outline" className="hover:bg-accent cursor-pointer">
                              {student.teamId.teamNumber || 'N/A'}
                            </Badge>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">No Team</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.teamId?.projectTitle ? (
                          <span className="truncate max-w-32 block" title={student.teamId.projectTitle}>
                            {student.teamId.projectTitle}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No Project</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.role ? (
                          <Badge variant="secondary">{student.role}</Badge>
                        ) : (
                          <span className="text-muted-foreground">No Role</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === student._id ? (
                          <div className="flex gap-2">
                            <Input
                              value={resumeInput}
                              onChange={(e) => setResumeInput(e.target.value)}
                              placeholder="Enter resume URL"
                              className="w-48"
                            />
                            <Button
                              size="sm"
                              onClick={() => saveResume(student)}
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {student.resumeUrl ? (
                              <a
                                href={student.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 underline"
                              >
                                View Resume
                              </a>
                            ) : (
                              <span className="text-muted-foreground">No Resume</span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(student)}
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
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