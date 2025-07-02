import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, User, Building2, TrendingUp, Award, Target, RefreshCw } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const dashboardRef = useRef();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        studentsRes,
        teamsRes,
        departmentsRes
      ] = await Promise.all([
        interviewAPI.getOverviewStats(),
        api.get('/students'),
        api.get('/teams'),
        api.get('/departments')
      ]);

      setOverviewStats(overviewRes.data);
      setStudents(studentsRes.data);
      setTeams(teamsRes.data);
      setDepartments(departmentsRes.data);

      // Fetch department-specific stats
      const deptStats = {};
      for (const dept of departmentsRes.data) {
        try {
          const deptRes = await interviewAPI.getDepartmentInterview(dept._id);
          deptStats[dept._id] = deptRes.data;
        } catch (error) {
          console.error(`Error fetching stats for department ${dept.name}:`, error);
        }
      }
      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

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
        <div className="text-lg">Loading statistics...</div>
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
          <h1 className="text-3xl font-bold tracking-tight">Interview Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of interview performance and results
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      <div ref={dashboardRef} id="interview-statistics-dashboard-content">
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
                          <TableHead>Registered Number</TableHead>
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
                            <TableCell>
                              {performer.studentId.registeredNumber || (
                                <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                              )}
                            </TableCell>
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
                      <TableHead>Registered Number</TableHead>
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
                          <TableCell>
                            {student.registeredNumber || (
                              <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                            )}
                          </TableCell>
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
                      // Use allInterviews from the API response for more accurate data
                      const teamInterviews = overviewStats?.allInterviews?.filter(
                        p => p.teamId?._id === team._id
                      ) || [];
                      
                      const avgTotal = teamInterviews.length > 0 
                        ? Math.round((teamInterviews.reduce((sum, p) => sum + p.totalScore, 0) / teamInterviews.length) * 100) / 100
                        : 0;
                      
                      const avgScore = teamInterviews.length > 0
                        ? Math.round((teamInterviews.reduce((sum, p) => sum + p.averageScore, 0) / teamInterviews.length) * 100) / 100
                        : 0;

                      // Calculate completion rate based on interviewed students vs total team members
                      const totalTeamMembers = team.students?.length || 0;
                      const interviewedMembers = teamInterviews.length;
                      const completionRate = totalTeamMembers > 0 
                        ? Math.round((interviewedMembers / totalTeamMembers) * 100)
                        : 0;

                      return (
                        <TableRow key={team._id}>
                          <TableCell className="font-medium">Team {team.teamNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{team.projectTitle}</div>
                              <div className="text-sm text-muted-foreground">{team.projectDescription}</div>
                            </div>
                          </TableCell>
                          <TableCell>{team.domain}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {team.students?.map((student, index) => (
                                <div key={index} className="text-sm">
                                  {student.name}
                                  {student.registeredNumber && (
                                    <span className="text-muted-foreground ml-1">({student.registeredNumber})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(avgTotal)}>
                              {avgTotal}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getScoreBadgeVariant(avgScore)}>
                              {avgScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={completionRate === 100 ? "default" : completionRate > 0 ? "secondary" : "outline"}>
                                {completionRate}% Complete
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {interviewedMembers}/{totalTeamMembers} interviewed
                              </div>
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
              const deptStats = departmentStats[dept._id];
              const deptStudents = students.filter(s => s.department?._id === dept._id);
              
              return (
                <Card key={dept._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      {dept.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deptStats ? (
                      <div className="space-y-6">
                        {/* Department Overview */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <div className="text-2xl font-bold">{deptStats.totalStudents}</div>
                            <div className="text-sm text-muted-foreground">Total Students</div>
                          </div>
                          <div className="space-y-2">
                            <div className={`text-2xl font-bold ${getScoreColor(deptStats.averageTotalScore)}`}>
                              {deptStats.averageTotalScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Total Score</div>
                          </div>
                          <div className="space-y-2">
                            <div className={`text-2xl font-bold ${getScoreColor(deptStats.averageAverageScore)}`}>
                              {deptStats.averageAverageScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Score</div>
                          </div>
                        </div>

                        {/* Department Students */}
                        <div>
                          <h4 className="font-semibold mb-3">Students</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Registered Number</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead>Total Score</TableHead>
                                <TableHead>Average Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {deptStudents.map((student) => {
                                const interview = deptStats.interviews?.find(
                                  p => p.studentId._id === student._id
                                );
                                
                                return (
                                  <TableRow key={student._id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>
                                      {student.registeredNumber || (
                                        <Badge variant="secondary" className="text-xs">Not Assigned</Badge>
                                      )}
                                    </TableCell>
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
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
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
    </div>
  );
} 