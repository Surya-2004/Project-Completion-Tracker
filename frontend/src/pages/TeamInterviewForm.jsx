import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Calculator, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { interviewAPI } from '@/services/api';
import api from '@/services/api';

const METRICS = [
  { key: 'selfIntro', label: 'Self Introduction', description: 'How well the student introduces themselves' },
  { key: 'communication', label: 'Communication Skills', description: 'Clarity and effectiveness of communication' },
  { key: 'confidence', label: 'Confidence Level', description: 'Student\'s confidence during the interview' },
  { key: 'dsa', label: 'DSA Knowledge', description: 'Understanding of Data Structures and Algorithms' },
  { key: 'problemSolving', label: 'Problem Solving', description: 'Ability to approach and solve problems' },
  { key: 'projectUnderstanding', label: 'Project Understanding', description: 'Understanding of their project' },
  { key: 'techStack', label: 'Tech Stack Knowledge', description: 'Knowledge of technologies used' },
  { key: 'roleExplanation', label: 'Role Explanation', description: 'How well they explain their role' },
  { key: 'teamwork', label: 'Teamwork', description: 'Understanding of teamwork and collaboration' },
  { key: 'adaptability', label: 'Adaptability', description: 'Ability to adapt to new situations' }
];

export default function TeamInterviewForm() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [students, setStudents] = useState([]);
  const [existingInterviews, setExistingInterviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentMetrics, setStudentMetrics] = useState({});
  const [teamStats, setTeamStats] = useState({
    totalStudents: 0,
    completedInterviews: 0,
    averageTotalScore: 0,
    averageAverageScore: 0
  });

  useEffect(() => {
    fetchData();
  }, [teamId]);

  useEffect(() => {
    calculateTeamStats();
  }, [studentMetrics]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamRes, interviewRes] = await Promise.all([
        api.get(`/teams/${teamId}`),
        interviewAPI.getTeamInterview(teamId).catch(() => ({ data: { scores: [] } }))
      ]);
      
      setTeam(teamRes.data);
      setStudents(teamRes.data.students || []);
      
      // Organize existing interviews by student ID
      const interviewsMap = {};
      interviewRes.data.scores.forEach(interview => {
        interviewsMap[interview.studentId._id] = interview;
      });
      setExistingInterviews(interviewsMap);
      
      // Initialize metrics for each student
      const initialMetrics = {};
      teamRes.data.students.forEach(student => {
        initialMetrics[student._id] = interviewsMap[student._id]?.metrics || {};
      });
      setStudentMetrics(initialMetrics);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamStats = () => {
    const studentIds = Object.keys(studentMetrics);
    let completedCount = 0;
    let totalScores = [];
    let averageScores = [];

    studentIds.forEach(studentId => {
      const metrics = studentMetrics[studentId];
      const scores = Object.values(metrics).filter(score => score !== null && score !== undefined && score > 0);
      
      if (scores.length > 0) {
        completedCount++;
        const total = scores.reduce((sum, score) => sum + score, 0);
        const average = total / scores.length;
        totalScores.push(total);
        averageScores.push(average);
      }
    });

    setTeamStats({
      totalStudents: studentIds.length,
      completedInterviews: completedCount,
      averageTotalScore: totalScores.length > 0 ? Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100 : 0,
      averageAverageScore: averageScores.length > 0 ? Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100 : 0
    });
  };

  const handleMetricChange = (studentId, key, value) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue !== null && (numValue < 1 || numValue > 10)) return;
    
    setStudentMetrics(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [key]: numValue
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const studentScores = Object.keys(studentMetrics).map(studentId => ({
        studentId,
        metrics: studentMetrics[studentId]
      }));
      
      await interviewAPI.addTeamInterview(teamId, { studentScores });
      navigate('/interviews');
    } catch (error) {
      console.error('Error saving team interview:', error);
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateStudentScores = (metrics) => {
    const scores = Object.values(metrics).filter(score => score !== null && score !== undefined && score > 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? total / scores.length : 0;
    return { total, average: Math.round(average * 100) / 100, filled: scores.length };
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Interview</h1>
          <p className="text-muted-foreground">
            Conduct interviews for Team {team.teamNumber}
          </p>
        </div>
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
              <Label className="text-sm font-medium">Team Number</Label>
              <div className="text-lg font-semibold">Team {team.teamNumber}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Project Title</Label>
              <div className="text-lg font-semibold">{team.projectTitle}</div>
            </div>
            <div>
              <Label className="text-sm font-medium">Domain</Label>
              <div className="flex items-center gap-2">
                <span>{team.domain}</span>
                <Badge variant={team.completed ? "default" : "secondary"}>
                  {team.completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Members</Label>
              <div className="text-lg font-semibold">{students.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Team Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamStats.totalStudents}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{teamStats.completedInterviews}</div>
              <div className="text-sm text-muted-foreground">Completed Interviews</div>
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
              <div className="text-sm text-muted-foreground">Avg Average Score</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Interview Progress</span>
              <span>{Math.round((teamStats.completedInterviews / teamStats.totalStudents) * 100)}%</span>
            </div>
            <Progress value={(teamStats.completedInterviews / teamStats.totalStudents) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Student Interviews */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Student Interviews</h2>
        {students.map((student, index) => {
          const metrics = studentMetrics[student._id] || {};
          const scores = calculateStudentScores(metrics);
          const hasExistingInterview = existingInterviews[student._id];
          
          return (
            <Card key={student._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{student.role}</span>
                        <Badge variant="outline">{student.department?.name}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(scores.total)}`}>
                      {scores.total} pts
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg: {scores.average}
                    </div>
                  </div>
                </div>
                {hasExistingInterview && (
                  <div className="text-sm text-muted-foreground">
                    Previous interview: {new Date(hasExistingInterview.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {METRICS.map((metric) => (
                    <div key={metric.key} className="space-y-2">
                      <Label htmlFor={`${student._id}-${metric.key}`} className="text-sm font-medium">
                        {metric.label}
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        {metric.description}
                      </div>
                      <Input
                        id={`${student._id}-${metric.key}`}
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1-10"
                        value={metrics[metric.key] || ''}
                        onChange={(e) => handleMetricChange(student._id, metric.key, e.target.value)}
                        className="w-full"
                      />
                      {metrics[metric.key] && (
                        <div className={`text-sm font-medium ${getScoreColor(metrics[metric.key])}`}>
                          Score: {metrics[metric.key]}/10
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Completion: {scores.filled}/{METRICS.length} metrics</span>
                    <span>{Math.round((scores.filled / METRICS.length) * 100)}%</span>
                  </div>
                  <Progress value={(scores.filled / METRICS.length) * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save All Interviews
            </div>
          )}
        </Button>
      </div>
    </div>
  );
} 