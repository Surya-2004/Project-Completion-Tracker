import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';

const defaultStudent = { name: '', department: '', role: '', resumeUrl: '' };

export default function AddTeam() {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [students, setStudents] = useState([{ ...defaultStudent }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { invalidateTeamCache } = useDataContext();

  // Use data manager for departments
  const { 
    data: departmentsData = [] 
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Ensure departments is always an array
  const departments = Array.isArray(departmentsData) ? departmentsData : [];

  const handleStudentChange = (idx, field, value) => {
    setStudents(students => students.map((s, i) => i === idx ? { ...s, [field]: value } : s));
    // Clear error when user starts typing
    if (errors[`student-${idx}-${field}`]) {
      setErrors(prev => ({ ...prev, [`student-${idx}-${field}`]: '' }));
    }
  };

  const addStudent = () => {
    if (students.length < 4) setStudents([...students, { ...defaultStudent }]);
  };
  const removeStudent = idx => {
    if (students.length > 1) setStudents(students.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate project fields
    if (!projectTitle.trim()) {
      newErrors.projectTitle = 'Project Title is required';
    }
    if (!domain.trim()) {
      newErrors.domain = 'Domain is required';
    }
    if (!projectDescription.trim()) {
      newErrors.projectDescription = 'Project Description is required';
    }

    // Validate students
    students.forEach((student, idx) => {
      if (!student.name.trim()) {
        newErrors[`student-${idx}-name`] = 'Student Name is required';
      }
      if (!student.department) {
        newErrors[`student-${idx}-department`] = 'Department is required';
      }
      if (!student.role.trim()) {
        newErrors[`student-${idx}-role`] = 'Role is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/teams', {
        projectTitle,
        projectDescription,
        domain,
        teamNumber: teamNumber ? Number(teamNumber) : undefined,
        githubUrl,
        hostedUrl,
        students: students.map(s => ({
          name: s.name,
          department: s.department || undefined,
          role: s.role,
          resumeUrl: s.resumeUrl
        }))
      });
      
      toast.success('Team added successfully!');
      
      // Reset form
      setProjectTitle('');
      setProjectDescription('');
      setDomain('');
      setTeamNumber('');
      setGithubUrl('');
      setHostedUrl('');
      setStudents([{ ...defaultStudent }]);
      setErrors({});
      
      // Invalidate related caches
      invalidateTeamCache();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">Add Team</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  type="text"
                  value={projectTitle}
                  onChange={e => {
                    setProjectTitle(e.target.value);
                    if (errors.projectTitle) setErrors(prev => ({ ...prev, projectTitle: '' }));
                  }}
                  placeholder="Enter project title"
                  className={errors.projectTitle ? 'border-red-500' : ''}
                />
                {errors.projectTitle && <p className="text-red-500 text-sm">{errors.projectTitle}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={e => {
                    setDomain(e.target.value);
                    if (errors.domain) setErrors(prev => ({ ...prev, domain: '' }));
                  }}
                  placeholder="Enter domain"
                  className={errors.domain ? 'border-red-500' : ''}
                />
                {errors.domain && <p className="text-red-500 text-sm">{errors.domain}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamNumber">Team Number</Label>
                <Input
                  id="teamNumber"
                  type="number"
                  value={teamNumber}
                  onChange={e => setTeamNumber(e.target.value)}
                  placeholder="Leave blank for auto-increment"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={e => {
                  setProjectDescription(e.target.value);
                  if (errors.projectDescription) setErrors(prev => ({ ...prev, projectDescription: '' }));
                }}
                placeholder="Describe the project"
                rows={4}
                className={errors.projectDescription ? 'border-red-500' : ''}
              />
              {errors.projectDescription && <p className="text-red-500 text-sm">{errors.projectDescription}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="GitHub URL (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostedUrl">Hosted URL</Label>
                <Input
                  id="hostedUrl"
                  type="url"
                  value={hostedUrl}
                  onChange={e => setHostedUrl(e.target.value)}
                  placeholder="Hosted URL (optional)"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-lg font-bold">Students *</Label>
              <div className="space-y-4 sm:space-y-6">
                {students.map((student, idx) => (
                  <Card key={idx} className="relative">
                    <CardContent className="p-3 sm:p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${idx}`}>Student Name *</Label>
                          <Input
                            id={`name-${idx}`}
                            type="text"
                            value={student.name}
                            onChange={e => handleStudentChange(idx, 'name', e.target.value)}
                            placeholder="Enter student name"
                            className={errors[`student-${idx}-name`] ? 'border-red-500' : ''}
                          />
                          {errors[`student-${idx}-name`] && <p className="text-red-500 text-sm">{errors[`student-${idx}-name`]}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`department-${idx}`}>Department *</Label>
                          <select
                            id={`department-${idx}`}
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors[`student-${idx}-department`] ? 'border-red-500' : ''}`}
                            value={student.department}
                            onChange={e => handleStudentChange(idx, 'department', e.target.value)}
                          >
                            <option value="">Select department</option>
                            {departments.map(dep => (
                              <option key={dep._id} value={dep._id}>{dep.name}</option>
                            ))}
                          </select>
                          {errors[`student-${idx}-department`] && <p className="text-red-500 text-sm">{errors[`student-${idx}-department`]}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`role-${idx}`}>Role *</Label>
                          <Input
                            id={`role-${idx}`}
                            type="text"
                            value={student.role}
                            onChange={e => handleStudentChange(idx, 'role', e.target.value)}
                            placeholder="Enter role"
                            className={errors[`student-${idx}-role`] ? 'border-red-500' : ''}
                          />
                          {errors[`student-${idx}-role`] && <p className="text-red-500 text-sm">{errors[`student-${idx}-role`]}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`resumeUrl-${idx}`}>Resume URL</Label>
                          <Input
                            id={`resumeUrl-${idx}`}
                            type="url"
                            value={student.resumeUrl}
                            onChange={e => handleStudentChange(idx, 'resumeUrl', e.target.value)}
                            placeholder="Resume URL (optional)"
                          />
                        </div>
                      </div>
                      {students.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeStudent(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addStudent}
                disabled={students.length >= 4}
              >
                + Add Student
              </Button>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Team'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
