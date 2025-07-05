import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save, Building2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AddStudent() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([
    { name: '', registeredNumber: '', role: '', email: '', resumeUrl: '' }
  ]);

  useEffect(() => {
    fetchDepartment();
  }, [departmentId]);

  const fetchDepartment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/departments/${departmentId}`);
      setDepartment(response.data);
    } catch (error) {
      console.error('Error fetching department:', error);
      toast.error('Failed to load department information');
      navigate('/departments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (idx, e) => {
    const { name, value } = e.target;
    setStudents(prev => prev.map((stu, i) => i === idx ? { ...stu, [name]: value } : stu));
  };

  const handleAddRow = () => {
    setStudents(prev => [...prev, { name: '', registeredNumber: '', role: '', email: '', resumeUrl: '' }]);
  };

  const handleRemoveRow = (idx) => {
    setStudents(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validStudents = students.filter(s => s.name.trim());
    if (validStudents.length === 0) {
      toast.error('At least one student with a name is required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/students/bulk', {
        students: validStudents.map(s => ({ ...s, department: departmentId }))
      });
      toast.success(`${validStudents.length} student(s) added successfully`);
      navigate(`/departments/${departmentId}`);
    } catch (error) {
      console.error('Error adding students:', error);
      toast.error(error.response?.data?.error || 'Failed to add students');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading department information...</div>
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
        <Button variant="outline" onClick={() => navigate(`/departments/${departmentId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Department
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Add Students</h1>
          </div>
          <p className="text-muted-foreground">
            Add one or more students to {department.name}
          </p>
        </div>
      </div>

      {/* Department Info */}
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
          </div>
        </CardContent>
      </Card>

      {/* Add Students Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {students.map((student, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border-b pb-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${idx}`}>Student Name *</Label>
                  <Input
                    id={`name-${idx}`}
                    name="name"
                    value={student.name}
                    onChange={e => handleInputChange(idx, e)}
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`registeredNumber-${idx}`}>Registered Number</Label>
                  <Input
                    id={`registeredNumber-${idx}`}
                    name="registeredNumber"
                    value={student.registeredNumber}
                    onChange={e => handleInputChange(idx, e)}
                    placeholder="e.g., REG2024CS001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${idx}`}>Email</Label>
                  <Input
                    id={`email-${idx}`}
                    name="email"
                    type="email"
                    value={student.email}
                    onChange={e => handleInputChange(idx, e)}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`role-${idx}`}>Role</Label>
                  <Input
                    id={`role-${idx}`}
                    name="role"
                    value={student.role}
                    onChange={e => handleInputChange(idx, e)}
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
                <div className="space-y-2 flex flex-row gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`resumeUrl-${idx}`}>Resume URL</Label>
                    <Input
                      id={`resumeUrl-${idx}`}
                      name="resumeUrl"
                      type="url"
                      value={student.resumeUrl}
                      onChange={e => handleInputChange(idx, e)}
                      placeholder="https://example.com/resume.pdf"
                    />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveRow(idx)} disabled={students.length === 1} title="Remove Student">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={handleAddRow} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Another Student
              </Button>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/departments/${departmentId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Adding Students...' : 'Add Students'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 