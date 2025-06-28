import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const defaultStudent = { name: '', department: '', role: '', resumeUrl: '' };

function CustomCheckbox({ checked, onChange, disabled }) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
}

export default function AddTeam() {
  const [projectTitle, setProjectTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [checkpoints, setCheckpoints] = useState({
    ideation: false,
    workSplit: false,
    localProjectDone: false,
    projectHosted: false,
  });
  const [githubUrl, setGithubUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [students, setStudents] = useState([{ ...defaultStudent }]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data)).catch(() => setDepartments([]));
  }, []);

  const handleStudentChange = (idx, field, value) => {
    setStudents(students => students.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addStudent = () => {
    if (students.length < 4) setStudents([...students, { ...defaultStudent }]);
  };
  const removeStudent = idx => {
    if (students.length > 1) setStudents(students.filter((_, i) => i !== idx));
  };

  const handleCheckpointChange = (field) => {
    setCheckpoints(cp => ({ ...cp, [field]: !cp[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/teams', {
        projectTitle,
        domain,
        teamNumber: teamNumber ? Number(teamNumber) : undefined,
        checkpoints,
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
      setProjectTitle('');
      setDomain('');
      setTeamNumber('');
      setCheckpoints({ ideation: false, workSplit: false, localProjectDone: false, projectHosted: false });
      setGithubUrl('');
      setHostedUrl('');
      setStudents([{ ...defaultStudent }]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">Add Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  type="text"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  placeholder="Project title (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  placeholder="Domain (optional)"
                />
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
            
            <div className="space-y-4">
              <Label className="text-lg font-bold">Checkpoints</Label>
              <div className="flex flex-wrap gap-6">
                {Object.entries(checkpoints).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <CustomCheckbox checked={value} onChange={() => handleCheckpointChange(key)} />
                    <Label className="capitalize cursor-pointer">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label className="text-lg font-bold">Students</Label>
              <div className="space-y-6">
                {students.map((student, idx) => (
                  <Card key={idx} className="relative">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${idx}`}>Name</Label>
                          <Input
                            id={`name-${idx}`}
                            type="text"
                            value={student.name}
                            onChange={e => handleStudentChange(idx, 'name', e.target.value)}
                            placeholder="Student name (optional)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`department-${idx}`}>Department</Label>
                          <select
                            id={`department-${idx}`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={student.department}
                            onChange={e => handleStudentChange(idx, 'department', e.target.value)}
                          >
                            <option value="">Select department (optional)</option>
                            {departments.map(dep => (
                              <option key={dep._id} value={dep._id}>{dep.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`role-${idx}`}>Role</Label>
                          <Input
                            id={`role-${idx}`}
                            type="text"
                            value={student.role}
                            onChange={e => handleStudentChange(idx, 'role', e.target.value)}
                            placeholder="Role (optional)"
                          />
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
