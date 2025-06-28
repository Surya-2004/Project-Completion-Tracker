import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import CheckpointProgressBar from '../components/CheckpointProgressBar';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [hostedUrl, setHostedUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.get(`/teams/${id}`)
      .then(res => {
        setTeam(res.data);
        setGithubUrl(res.data.githubUrl || '');
        setHostedUrl(res.data.hostedUrl || '');
      })
      .catch((err) => {
        console.error('Error fetching team:', err);
        setError('Failed to fetch team');
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSaveUrls = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await api.patch(`/teams/${id}/urls`, { githubUrl, hostedUrl });
      setTeam(res.data);
      setSaveMsg('Links updated!');
    } catch {
      setSaveMsg('Failed to update links');
    } finally {
      setSaving(false);
    }
  };

  const refreshTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
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
    <div className="max-w-4xl mx-auto p-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Team Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Team Number</Label>
              <div className="font-semibold text-lg">{team.teamNumber || <span className="text-muted-foreground">—</span>}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Project Title</Label>
              <div className="font-semibold">{team.projectTitle || <span className="text-muted-foreground">—</span>}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Domain</Label>
              <div className="font-semibold">{team.domain || <span className="text-muted-foreground">—</span>}</div>
            </div>
          </div>

          {team.projectDescription && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Project Description</Label>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{team.projectDescription}</p>
              </div>
            </div>
          )}

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
            <h3 className="text-lg font-bold">Team Members ({team.students?.length || 0})</h3>
            {team.students && team.students.length > 0 ? (
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
                          <Label className="text-muted-foreground">Role</Label>
                          <div>
                            {student.role ? (
                              <Badge variant="secondary">{student.role}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
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
              checkpoints={team.checkpoints}
              teamId={team._id}
              onRefresh={refreshTeam}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
