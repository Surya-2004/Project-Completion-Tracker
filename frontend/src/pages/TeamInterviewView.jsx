import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, BarChart3, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { interviewAPI } from '@/services/api';
import api from '@/services/api';

export default function TeamInterviewView() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, interviewRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        interviewAPI.getTeamInterview(teamId).catch(() => ({ data: { scores: [] } }))
      ]);
      
      setTeam(teamRes.data);
      setTeamStats(interviewRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        setTeam(null); // Team not found
      } else {
        console.error('Network or server error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-red-600">Team not found</div>
      </div>
    );
  }

  if (!teamStats || teamStats.scores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-red-600">No interview data found for this team</div>
        <Button 
          onClick={() => navigate(`/interviews/team/${teamId}`)}
          className="mt-4"
        >
          Conduct Team Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Team Interview Results</h1>
          <p className="text-muted-foreground">
            Interview results for Team {team.teamNumber}
          </p>
        </div>
        <Button onClick={() => navigate(`/interviews/team/${teamId}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Team Interview
        </Button>
      </div>

      {/* Team Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Team Number</div>
              <div className="text-lg font-semibold">Team {team.teamNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Project Title</div>
              <div className="text-lg font-semibold">{team.projectTitle}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Domain</div>
              <div className="flex items-center gap-2">
                <span>{team.domain}</span>
                <Badge variant={team.completed ? "default" : "secondary"}>
                  {team.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Members</div>
              <div className="text-lg font-semibold">{team.students?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Team Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamStats.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Students Interviewed</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(teamStats.averageTotalScore)}`}>
                {teamStats.averageTotalScore}
              </div>
              <div className="text-sm text-muted-foreground">Avg Total Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(teamStats.averageAverageScore)}`}>
                {teamStats.averageAverageScore}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{teamStats.highestScore}</div>
              <div className="text-sm text-muted-foreground">Highest Score</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Interview Progress</span>
              <span>{Math.round((teamStats.totalStudents / (team.students?.length || 1)) * 100)}%</span>
            </div>
            <Progress value={(teamStats.totalStudents / (team.students?.length || 1)) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Individual Student Results */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Score</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamStats.scores.map((score) => (
                <TableRow key={score._id}>
                  <TableCell className="font-medium">{score.studentId.name}</TableCell>
                  <TableCell>{score.studentId.department?.name}</TableCell>
                  <TableCell>{score.studentId.role}</TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(score.totalScore)}>
                      {score.totalScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(score.averageScore)}>
                      {score.averageScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        score.averageScore >= 8 ? 'bg-green-500' : 
                        score.averageScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm">
                        {score.averageScore >= 8 ? 'Excellent' : 
                         score.averageScore >= 6 ? 'Good' : 
                         score.averageScore >= 4 ? 'Fair' : 'Needs Improvement'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/interviews/student/${score.studentId._id}/view`)}
                    >
                      <User className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamStats.scores.map((score) => {
              const percentage = (score.totalScore / 100) * 100; // Assuming max score is 100
              return (
                <div key={score._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{score.studentId.name}</div>
                        <div className="text-sm text-muted-foreground">{score.studentId.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getScoreColor(score.totalScore)}`}>
                        {score.totalScore} pts
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {score.averageScore}
                      </div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 