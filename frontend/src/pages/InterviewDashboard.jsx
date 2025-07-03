import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, User, Plus, Eye, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiDataManager, invalidateCache } from '../hooks/useDataManager';
import { interviewAPI } from '../services/api';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function InterviewDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [interviewData, setInterviewData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Use multi-data manager for fetching students and teams
  const { 
    data, 
    loading, 
    error,
    refreshData
  } = useMultiDataManager([
    { key: 'students', endpoint: '/students', cacheKey: 'students' },
    { key: 'teams', endpoint: '/teams', cacheKey: 'teams' }
  ]);

  const students = data.students || [];
  const teams = data.teams || [];

  // Fetch interview data for all students and teams
  const fetchInterviewData = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch all interview scores
      const allInterviewsResponse = await interviewAPI.getAllInterviews();
      const allInterviews = allInterviewsResponse.data || [];
      
      // Create a map of student interviews
      const studentInterviews = {};
      allInterviews.forEach(interview => {
        studentInterviews[interview.studentId._id] = interview;
      });
      
      // Create a map of team interviews
      const teamInterviews = {};
      teams.forEach(team => {
        const teamStudentInterviews = allInterviews.filter(
          interview => interview.teamId?._id === team._id
        );
        teamInterviews[team._id] = {
          totalStudents: team.students?.length || 0,
          interviewedStudents: teamStudentInterviews.length,
          interviews: teamStudentInterviews
        };
      });
      
      setInterviewData({
        studentInterviews,
        teamInterviews
      });
    } catch (error) {
      console.error('Error fetching interview data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch interview data on component mount
  useEffect(() => {
    fetchInterviewData();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = async () => {
    invalidateCache('students');
    invalidateCache('teams');
    await refreshData();
    await fetchInterviewData();
  };

  const getStudentInterviewStatus = (studentId) => {
    const interview = interviewData.studentInterviews?.[studentId];
    if (!interview) return 'Not Interviewed';
    // Check if student has any metrics with scores
    const hasScores = Object.values(interview.metrics || {}).some(
      score => score !== null && score !== undefined && score > 0
    );
    return hasScores ? 'Completed' : 'In Progress';
  };

  const getTeamInterviewStatus = (teamId) => {
    const teamData = interviewData.teamInterviews?.[teamId];
    if (!teamData) return 'Not Interviewed';
    if (teamData.interviewedStudents === 0) return 'Not Interviewed';
    if (teamData.interviewedStudents === teamData.totalStudents) return 'Completed';
    return 'In Progress';
  };

  const filteredStudents = students.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.role?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' ||
      (statusFilter === 'completed' && getStudentInterviewStatus(student._id) === 'Completed') ||
      (statusFilter === 'not_completed' && getStudentInterviewStatus(student._id) !== 'Completed'))
  );

  const filteredTeams = teams.filter(team =>
    (team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamNumber?.toString().includes(searchTerm)) &&
    (statusFilter === 'all' ||
      (statusFilter === 'completed' && getTeamInterviewStatus(team._id) === 'Completed') ||
      (statusFilter === 'not_completed' && getTeamInterviewStatus(team._id) !== 'Completed'))
  );

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Not Interviewed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading interview dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                🎯 Interview Dashboard
              </CardTitle>
              <p className="text-muted-foreground">
                Manage and conduct interviews for students and teams
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
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teams ({teams.length})
              </TabsTrigger>
            </TabsList>

            {/* Search Bar and Status Filter */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not_completed">Not Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => navigate('/interviews/statistics')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Statistics
              </Button>
            </div>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <div className="grid gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <Badge variant="outline">{student.department?.name || 'No Department'}</Badge>
                            <Badge variant="secondary">{student.role || 'No Role'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Team: {student.teamId?.projectTitle ? `Team ${student.teamId.teamNumber} - ${student.teamId.projectTitle}` : 'No Team Assigned'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(getStudentInterviewStatus(student._id))}>
                            {getStudentInterviewStatus(student._id)}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/interviews/student/${student._id}`)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Interview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/interviews/student/${student._id}/view`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No students found matching your search.' : 'No students available.'}
                </div>
              )}
            </TabsContent>

            {/* Teams Tab */}
            <TabsContent value="teams" className="space-y-4">
              <div className="grid gap-4">
                {filteredTeams.map((team) => (
                  <Card key={team._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              Team {team.teamNumber} - {team.projectTitle || 'Untitled Project'}
                            </h3>
                            <Badge variant="outline">{team.domain || 'No Domain'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {team.students?.length || 0} students • {team.projectDescription || 'No description'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(getTeamInterviewStatus(team._id))}>
                            {getTeamInterviewStatus(team._id)}
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/interviews/team/${team._id}`)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Interview Team
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/interviews/team/${team._id}/view`)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTeams.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No teams found matching your search.' : 'No teams available.'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 