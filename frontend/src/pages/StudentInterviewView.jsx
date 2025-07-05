import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, BarChart3, FolderOpen, Github, ExternalLink, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function StudentInterviewView() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentRes, interviewRes] = await Promise.all([
        api.get(`/students/${studentId}`),
        interviewAPI.getStudentInterview(studentId).catch(() => null)
      ]);
      
      setStudent(studentRes.data);
      
      if (interviewRes?.data) {
        setInterview(interviewRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 404) {
        setStudent(null); // Student not found
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

  if (!student) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-red-600">Student not found</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-red-600">No interview data found for this student</div>
        <Button 
          onClick={() => navigate(`/interviews/student/${studentId}`)}
          className="mt-4"
        >
          Conduct Interview
        </Button>
      </div>
    );
  }

  const filledMetrics = Object.values(interview?.metrics || {}).filter(score => score !== null && score !== undefined && score > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
          <p className="text-muted-foreground">
            Interview results for {student.name}
          </p>
        </div>
        <Button onClick={() => navigate(`/interviews/student/${studentId}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Interview
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Student Information */}
        <Card className="lg:col-span-1 h-fit">
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

            {/* Interview Date */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Interview Date</span>
                <Badge variant="secondary" className="text-xs">
                  {new Date(interview.updatedAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="text-xs text-gray-300">
                {new Date(interview.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Information */}
        {student.teamId ? (
          <Card className="lg:col-span-2 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Project Title</div>
                  <div className="text-lg font-semibold">{student.teamId.projectTitle}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Domain</div>
                  <div className="flex items-center gap-2">
                    <span>{student.teamId.domain}</span>
                    <Badge variant={student.teamId.completed ? "default" : "secondary"}>
                      {student.teamId.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Project Description</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {student.teamId.projectDescription || 'No description available'}
                </div>
              </div>
              
              {/* Project Links */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Project Links</div>
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
        ) : (
          <Card className="lg:col-span-2 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <div className="text-muted-foreground">No project information available</div>
                <div className="text-sm text-muted-foreground mt-2">Student is not assigned to a team</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Viewer - Full Width */}
        <Card className="lg:col-span-3">
          <ResumeViewer resumeUrl={student.resumeUrl} studentName={student.name} />
        </Card>

        {/* Interview Results */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Interview Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filledMetrics}</div>
                <div className="text-sm text-muted-foreground">Metrics Evaluated</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(interview.totalScore)}`}>
                  {interview.totalScore}
                </div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(interview.averageScore)}`}>
                  {interview.averageScore}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {METRICS.map((metric) => {
                  const score = interview.metrics[metric.key];
                  return (
                    <div key={metric.key} className="space-y-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{metric.label}</div>
                          <div className="text-xs text-muted-foreground">{metric.description}</div>
                        </div>
                        {score ? (
                          <Badge variant={getScoreBadgeVariant(score)}>
                            {score}/10
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not evaluated</Badge>
                        )}
                      </div>
                      {score && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Score</span>
                            <span>{score}/10</span>
                          </div>
                          <Progress value={(score / 10) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Performance Analysis</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(interview.averageScore)}`}>
                        {interview.averageScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Performance</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {interview.averageScore >= 8 ? 'Excellent' : 
                         interview.averageScore >= 6 ? 'Good' : 
                         interview.averageScore >= 4 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.round((filledMetrics / METRICS.length) * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Evaluation Completeness</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {filledMetrics} out of {METRICS.length} metrics evaluated
                      </div>
                    </div>
                    <Progress value={(filledMetrics / METRICS.length) * 100} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 