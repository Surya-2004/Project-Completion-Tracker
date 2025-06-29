import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, User, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultiDataManager } from '../hooks/useDataManager';

export default function InterviewDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Use multi-data manager for fetching students and teams
  const { 
    data, 
    loading, 
    error 
  } = useMultiDataManager([
    { key: 'students', endpoint: '/students', cacheKey: 'students' },
    { key: 'teams', endpoint: '/teams', cacheKey: 'teams' }
  ], {
    forceRefresh: true // Force refresh when navigating to this page
  });

  const students = data.students || [];
  const teams = data.teams || [];

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(team =>
    team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.teamNumber?.toString().includes(searchTerm)
  );

  const getStudentInterviewStatus = () => {
    // This would need to be implemented based on your interview data structure
    return 'Not Interviewed'; // Placeholder
  };

  const getTeamInterviewStatus = () => {
    // This would need to be implemented based on your interview data structure
    return 'Not Interviewed'; // Placeholder
  };

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
          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            🎯 Interview Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Manage and conduct interviews for students and teams
          </p>
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

            <TabsContent value="students" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search students by name or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={() => navigate('/interviews/statistics')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View Statistics
                </Button>
              </div>

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
                            Team: {student.team?.projectTitle || 'No Team Assigned'}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(getStudentInterviewStatus())}>
                            {getStudentInterviewStatus()}
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

            <TabsContent value="teams" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search teams by project title, domain, or team number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={() => navigate('/interviews/statistics')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  View Statistics
                </Button>
              </div>

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
                          <Badge variant={getStatusBadgeVariant(getTeamInterviewStatus())}>
                            {getTeamInterviewStatus()}
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