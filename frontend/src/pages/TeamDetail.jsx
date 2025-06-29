import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CheckpointProgressBar from '../components/CheckpointProgressBar';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import toast from 'react-hot-toast';
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';

export default function TeamDetail() {
  const { id } = useParams();
  const [githubUrl, setGithubUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  
  // New state for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [studentRoles, setStudentRoles] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);
  const [errors, setErrors] = useState({});

  const { invalidateTeamCache } = useDataContext();

  // Use data manager for team data with force refresh on navigation
  const { 
    data: team, 
    loading, 
    error, 
    updateData: updateTeam 
  } = useDataManager(`/teams/${id}`, {
    forceRefresh: true, // Force refresh when navigating to this page
    cacheKey: `/teams/${id}`
  });

  // Initialize form data when team data is loaded
  useEffect(() => {
    if (team) {
      setGithubUrl(team.githubUrl || '');
      setHostedUrl(team.hostedUrl || '');
      setProjectTitle(team.projectTitle || '');
      setDomain(team.domain || '');
      setProjectDescription(team.projectDescription || '');
      
      // Initialize student roles
      const roles = {};
      if (Array.isArray(team.students)) {
        team.students.forEach(student => {
          roles[student._id] = student.role || '';
        });
      }
      setStudentRoles(roles);
    }
  }, [team]);

  const handleSaveUrls = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await api.patch(`/teams/${id}/urls`, { githubUrl, hostedUrl });
      
      // Update local state immediately
      updateTeam(res.data);
      setSaveMsg('Links updated!');
      
      // Invalidate related caches
      invalidateTeamCache();
    } catch {
      setSaveMsg('Failed to update links');
    } finally {
      setSaving(false);
    }
  };

  const validateDetails = () => {
    const newErrors = {};
    
    if (!projectTitle.trim()) {
      newErrors.projectTitle = 'Project Title is required';
    }
    if (!domain.trim()) {
      newErrors.domain = 'Domain is required';
    }
    if (!projectDescription.trim()) {
      newErrors.projectDescription = 'Project Description is required';
    }

    // Validate student roles
    Object.keys(studentRoles).forEach(studentId => {
      if (!studentRoles[studentId].trim()) {
        newErrors[`role-${studentId}`] = 'Role is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    
    if (!validateDetails()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingDetails(true);
    try {
      const students = Object.keys(studentRoles).map(studentId => ({
        _id: studentId,
        role: studentRoles[studentId]
      }));

      const res = await api.patch(`/teams/${id}/details`, {
        projectTitle,
        domain,
        projectDescription,
        students
      });
      
      // Update local state immediately
      updateTeam(res.data);
      setIsEditing(false);
      toast.success('Team details updated successfully!');
      
      // Invalidate related caches
      invalidateTeamCache();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update team details');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProjectTitle(team?.projectTitle || '');
    setDomain(team?.domain || '');
    setProjectDescription(team?.projectDescription || '');
    
    const roles = {};
    if (Array.isArray(team?.students)) {
      team.students.forEach(student => {
        roles[student._id] = student.role || '';
      });
    }
    setStudentRoles(roles);
    setErrors({});
  };

  const refreshTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      updateTeam(res.data);
    } catch (err) {
      console.error('Error refreshing team:', err);
    }
  };

  if (loading) return (
    <Card className="max-w-4xl mx-auto p-8 mt-8">
      <CardContent>
        <p className="text-muted-foreground">Loading team...</p>
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
  
  if (!team) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mt-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">Team Detail</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
                Edit Details
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={handleCancelEdit} variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSaveDetails} disabled={savingDetails} className="w-full sm:w-auto">
                  {savingDetails ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Team Number</Label>
              <div className="font-semibold text-lg">{team.teamNumber || <span className="text-muted-foreground">—</span>}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Project Title *</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
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
              ) : (
                <div className="font-semibold">{team.projectTitle || <span className="text-muted-foreground">—</span>}</div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Domain *</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
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
              ) : (
                <div className="font-semibold">{team.domain || <span className="text-muted-foreground">—</span>}</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Project Description *</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
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
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{team.projectDescription || <span className="text-muted-foreground">—</span>}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Project Links</h3>
            <form onSubmit={handleSaveUrls} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Links'}
              </Button>
              {saveMsg && (
                <div className={`font-medium ${saveMsg.includes('Failed') ? 'text-destructive' : 'text-green-600'}`}>
                  {saveMsg}
                </div>
              )}
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Team Members ({(team.students || []).length})</h3>
            {Array.isArray(team.students) && team.students.length > 0 ? (
              <div className="grid gap-4">
                {team.students.map(student => (
                  <Card key={student._id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="font-semibold text-lg">{student.name || <span className="text-muted-foreground">Unnamed Student</span>}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Department</Label>
                          <div>{student.department?.name || <span className="text-muted-foreground">—</span>}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Role *</Label>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={studentRoles[student._id] || ''}
                                onChange={e => {
                                  setStudentRoles(prev => ({ ...prev, [student._id]: e.target.value }));
                                  if (errors[`role-${student._id}`]) {
                                    setErrors(prev => ({ ...prev, [`role-${student._id}`]: '' }));
                                  }
                                }}
                                placeholder="Enter role"
                                className={errors[`role-${student._id}`] ? 'border-red-500' : ''}
                              />
                              {errors[`role-${student._id}`] && <p className="text-red-500 text-sm">{errors[`role-${student._id}`]}</p>}
                            </div>
                          ) : (
                            <div>
                              {student.role ? (
                                <Badge variant="secondary">{student.role}</Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Resume</Label>
                          <div>
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
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No students found.</div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Checkpoints</h3>
            <CheckpointProgressBar
              checkpoints={team.checkpoints || []}
              teamId={team._id}
              onRefresh={refreshTeam}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
