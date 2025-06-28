import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
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
    setLoading(true);
    api.get(`/teams/${id}`)
      .then(res => {
        setTeam(res.data);
        setGithubUrl(res.data.githubUrl || '');
        setHostedUrl(res.data.hostedUrl || '');
      })
      .catch(() => setError('Failed to fetch team'))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (loading) return (
    <Card className="max-w-3xl mx-auto p-8">
      <CardContent>
        <p className="text-muted-foreground">Loading team...</p>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="max-w-3xl mx-auto p-8">
      <CardContent>
        <p className="text-destructive font-medium">{error}</p>
      </CardContent>
    </Card>
  );
  
  if (!team) return null;

  return (
    <div className="max-w-3xl mx-auto p-8">
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

          <form onSubmit={handleSaveUrls} className="space-y-4">
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
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Links'}
            </Button>
            {saveMsg && (
              <div className={`font-medium ${saveMsg.includes('Failed') ? 'text-destructive' : 'text-green-600'}`}>
                {saveMsg}
              </div>
            )}
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Team Members</h3>
            {team.students && team.students.length > 0 ? (
              <div className="grid gap-4">
                {team.students.map(student => (
                  <Card key={student._id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="font-semibold">{student.name || <span className="text-muted-foreground">—</span>}</div>
                      <div className="text-muted-foreground">
                        Department: {student.department?.name || <span className="text-muted-foreground">—</span>}
                      </div>
                      <div className="text-muted-foreground">
                        Role: {student.role ? (
                          <Badge variant="secondary">{student.role}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        Resume: {student.resumeUrl ? (
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">No students found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
