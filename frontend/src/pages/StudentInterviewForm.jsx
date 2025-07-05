import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calculator, FolderOpen, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { interviewAPI } from '@/services/api';
import api from '@/services/api';
import ResumeViewer from '@/components/ResumeViewer';

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

export default function StudentInterviewForm() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [existingInterview, setExistingInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [filledMetrics, setFilledMetrics] = useState(0);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  useEffect(() => {
    calculateScores();
  }, [metrics]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRes, interviewRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        interviewAPI.getStudentInterview(studentId).catch(() => null)
      ]);
      
      setStudent(studentRes.data);
      
      if (interviewRes?.data) {
        setExistingInterview(interviewRes.data);
        setMetrics(interviewRes.data.metrics || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        setStudent(null);
      } else {
        console.error('Network or server error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = () => {
    const scores = Object.values(metrics || {}).filter(score => score !== null && score !== undefined && score > 0);
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? total / scores.length : 0;
    
    setTotalScore(total);
    setAverageScore(Math.round(average * 100) / 100);
    setFilledMetrics(scores.length);
  };

  const handleMetricChange = (key, value) => {
    const numValue = value === '' ? null : parseInt(value);
    if (numValue !== null && (numValue < 1 || numValue > 10)) return;
    
    setMetrics(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        metrics,
        teamId: student?.teamId
      };
      
      await interviewAPI.addStudentInterview(studentId, data);
      navigate('/interviews');
    } catch (error) {
      console.error('Error saving interview:', error);
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-red-600">Student not found</div>
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
          <h1 className="text-3xl font-bold tracking-tight">Student Interview</h1>
          <p className="text-muted-foreground">
            Conduct interview for {student.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Name and Key Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{student.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {student.role}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {student.department?.name}
                    </Badge>
                    {student.registeredNumber && (
                      <Badge variant="outline" className="text-xs">
                        #{student.registeredNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Contact</span>
                <div className="flex gap-2">
                  {student.email && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${student.email}`, '_blank')}
                      className="h-7 px-2"
                    >
                      <User className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Team Information */}
            {student.teamId && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Team</span>
                  <Badge variant="outline" className="text-xs">
                    Team {student.teamId.teamNumber}
                  </Badge>
                </div>
              </div>
            )}

            {/* Previous Interview Info */}
            {existingInterview && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Previous Interview</span>
                  <Badge variant="secondary" className="text-xs">
                    Available
                  </Badge>
                </div>
                <div className="text-xs text-gray-300">
                  Last updated: {new Date(existingInterview.updatedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Information */}
        {student.teamId && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Project Title</Label>
                  <div className="text-lg font-semibold">{student.teamId.projectTitle}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Domain</Label>
                  <div className="flex items-center gap-2">
                    <span>{student.teamId.domain}</span>
                    <Badge variant={student.teamId.completed ? "default" : "secondary"}>
                      {student.teamId.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Project Description</Label>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {student.teamId.projectDescription || 'No description available'}
                </div>
              </div>
              
              {/* Project Links */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Links</Label>
                <div className="flex gap-2">
                  {student.teamId.githubUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(student.teamId.githubUrl, '_blank')}
                      className="flex-1"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                  {student.teamId.hostedUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(student.teamId.hostedUrl, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                  )}
                </div>
                {!student.teamId.githubUrl && !student.teamId.hostedUrl && (
                  <div className="text-sm text-muted-foreground">
                    No project links available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Viewer - Full Width */}
        <Card className="lg:col-span-3">
          <ResumeViewer resumeUrl={student.resumeUrl} studentName={student.name} />
        </Card>

        {/* Interview Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Interview Metrics
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Rate each metric on a scale of 1-10. All fields are optional.
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filledMetrics}</div>
                <div className="text-sm text-muted-foreground">Metrics Filled</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                  {totalScore}
                </div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span>{Math.round((filledMetrics / METRICS.length) * 100)}%</span>
              </div>
              <Progress value={(filledMetrics / METRICS.length) * 100} />
            </div>

            {/* Metrics Input */}
            <div className="grid gap-4 md:grid-cols-2">
              {METRICS.map((metric) => (
                <div key={metric.key} className="space-y-2">
                  <Label htmlFor={metric.key} className="text-sm font-medium">
                    {metric.label}
                  </Label>
                  <div className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </div>
                  <Input
                    id={metric.key}
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    value={metrics[metric.key] || ''}
                    onChange={(e) => handleMetricChange(metric.key, e.target.value)}
                    className="w-full"
                  />
                  {metrics[metric.key] && (
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-medium ${getScoreColor(metrics[metric.key])}`}>
                        Score: {metrics[metric.key]}/10
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
                    Save Interview
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 