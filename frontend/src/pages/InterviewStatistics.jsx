import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, User, Building2, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { interviewAPI } from '@/services/api';
import api from '@/services/api';

export default function InterviewStatistics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewStats, setOverviewStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [departmentStats, setDepartmentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, departmentsRes, teamsRes, studentsRes] = await Promise.all([
        interviewAPI.getOverviewStats(),
        api.get('/departments'),
        api.get('/teams'),
        api.get('/students')
      ]);

      setOverviewStats(overviewRes.data);
      setDepartments(departmentsRes.data);
      setTeams(teamsRes.data);
      setStudents(studentsRes.data);

      // Fetch department-specific stats
      const deptStats = {};
      for (const dept of departmentsRes.data) {
        try {
          const deptRes = await interviewAPI.getDepartmentInterview(dept._id);
          deptStats[dept._id] = deptRes.data;
        } catch (error) {
          console.error(`Error fetching stats for department ${dept._id}:`, error);
        }
      }
      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/interviews')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of interview performance
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Per Student
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Per Team
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Per Department
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overviewStats && (
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats.totalInterviews}</div>
                    <p className="text-xs text-muted-foreground">
                      Students interviewed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Total Score</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(overviewStats.averageTotalScore)}`}>
                      {overviewStats.averageTotalScore}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all interviews
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(overviewStats.averageAverageScore)}`}>
                      {overviewStats.averageAverageScore}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per metric average
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {overviewStats.highestScore}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Best performance
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Total Score</TableHead>
                        <TableHead>Average Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overviewStats.topPerformers.map((performer, index) => (
                        <TableRow key={performer._id}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{performer.studentId.name}</TableCell>
                          <TableCell>{performer.studentId.department?.name}</TableCell>
                          <TableCell>Team {performer.teamId?.teamNumber}</TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(performer.totalScore)}>
                              {performer.totalScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(performer.averageScore)}>
                              {performer.averageScore}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(overviewStats.departmentStats).map(([deptName, stats]) => (
                      <div key={deptName} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{deptName}</span>
                          <div className="flex gap-4 text-sm">
                            <span>Students: {stats.totalStudents}</span>
                            <span>Avg Total: {stats.averageTotalScore}</span>
                            <span>Avg Score: {stats.averageAverageScore}</span>
                          </div>
                        </div>
                        <Progress 
                          value={(stats.averageTotalScore / 100) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Metric Averages */}
              <Card>
                <CardHeader>
                  <CardTitle>Metric Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(overviewStats.metricAverages).map(([metric, average]) => (
                      <div key={metric} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <Badge variant={getScoreBadgeVariant(average)}>
                            {average}
                          </Badge>
                        </div>
                        <Progress value={(average / 10) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Per Student Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Interview Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const interview = overviewStats?.topPerformers.find(
                      p => p.studentId._id === student._id
                    );
                    
                    return (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.department?.name}</TableCell>
                        <TableCell>Team {student.teamId?.teamNumber}</TableCell>
                        <TableCell>
                          {interview ? (
                            <Badge variant={getScoreBadgeVariant(interview.totalScore)}>
                              {interview.totalScore}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Not interviewed</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {interview ? (
                            <Badge variant={getScoreBadgeVariant(interview.averageScore)}>
                              {interview.averageScore}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {interview ? (
                            <Badge variant="default">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per Team Tab */}
        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Interview Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Avg Total Score</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => {
                    const teamInterviews = overviewStats?.topPerformers.filter(
                      p => p.teamId?._id === team._id
                    ) || [];
                    
                    const avgTotal = teamInterviews.length > 0 
                      ? Math.round((teamInterviews.reduce((sum, p) => sum + p.totalScore, 0) / teamInterviews.length) * 100) / 100
                      : 0;
                    
                    const avgScore = teamInterviews.length > 0
                      ? Math.round((teamInterviews.reduce((sum, p) => sum + p.averageScore, 0) / teamInterviews.length) * 100) / 100
                      : 0;

                    const completionRate = team.students?.length > 0 
                      ? Math.round((teamInterviews.length / team.students.length) * 100)
                      : 0;

                    return (
                      <TableRow key={team._id}>
                        <TableCell className="font-medium">Team {team.teamNumber}</TableCell>
                        <TableCell>{team.projectTitle}</TableCell>
                        <TableCell>{team.domain}</TableCell>
                        <TableCell>{team.students?.length || 0}</TableCell>
                        <TableCell>
                          {avgTotal > 0 ? (
                            <Badge variant={getScoreBadgeVariant(avgTotal)}>
                              {avgTotal}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {avgScore > 0 ? (
                            <Badge variant={getScoreBadgeVariant(avgScore)}>
                              {avgScore}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                              {completionRate}% Complete
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Per Department Tab */}
        <TabsContent value="departments" className="space-y-6">
          {departments.map((dept) => {
            const stats = departmentStats[dept._id];
            
            return (
              <Card key={dept._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {stats ? (
                    <>
                      {/* Department Summary */}
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                          <div className="text-sm text-muted-foreground">Students Interviewed</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(stats.averageTotalScore)}`}>
                            {stats.averageTotalScore}
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Total Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(stats.averageAverageScore)}`}>
                            {stats.averageAverageScore}
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.highestScore}</div>
                          <div className="text-sm text-muted-foreground">Highest Score</div>
                        </div>
                      </div>

                      {/* Metric Breakdown */}
                      <div>
                        <h4 className="font-medium mb-3">Metric Performance</h4>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {Object.entries(stats.metricAverages).map(([metric, average]) => (
                            <div key={metric} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium capitalize">
                                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <Badge variant={getScoreBadgeVariant(average)}>
                                  {average}
                                </Badge>
                              </div>
                              <Progress value={(average / 10) * 100} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student List */}
                      <div>
                        <h4 className="font-medium mb-3">Student Results</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student</TableHead>
                              <TableHead>Team</TableHead>
                              <TableHead>Total Score</TableHead>
                              <TableHead>Average Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.scores.map((score) => (
                              <TableRow key={score._id}>
                                <TableCell className="font-medium">{score.studentId.name}</TableCell>
                                <TableCell>Team {score.teamId?.teamNumber}</TableCell>
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
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No interview data available for this department
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
} 