import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function AddStudent() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registeredNumber: '',
    role: '',
    resumeUrl: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Student name is required');
      return;
    }

    setSaving(true);
    try {
      await api.post('/students', {
        ...formData,
        department: departmentId
      });
      
      toast.success('Student added successfully');
      navigate(`/departments/${departmentId}`);
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.error || 'Failed to add student');
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
            <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>
          </div>
          <p className="text-muted-foreground">
            Add a new student to {department.name}
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

      {/* Add Student Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Student Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter student name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registeredNumber">Registered Number</Label>
                <Input
                  id="registeredNumber"
                  name="registeredNumber"
                  value={formData.registeredNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., REG2024CS001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Frontend Developer, Backend Developer, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                name="resumeUrl"
                type="url"
                value={formData.resumeUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/resume.pdf"
              />
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
                {saving ? 'Adding Student...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 