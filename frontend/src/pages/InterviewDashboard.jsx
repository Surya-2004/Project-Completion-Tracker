import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, User, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/services/api';

export default function InterviewDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, teamsRes] = await Promise.all([
        api.get('/students'),
        api.get('/teams')
      ]);
      console.log('Students data:', studentsRes.data);
      console.log('Teams data:', teamsRes.data);
      setStudents(studentsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays to prevent further errors
      setStudents([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeams = teams.filter(team =>
    team.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.teamNumber?.toString().includes(searchTerm)
  );

  const handleInterviewStudent = (studentId) => {
    navigate(`/interviews/student/${studentId}`);
  };

  const handleInterviewTeam = (teamId) => {
    navigate(`/interviews/team/${teamId}`);
  };

  const handleViewStudentInterview = (studentId) => {
    navigate(`/interviews/student/${studentId}/view`);
  };

  const handleViewTeamInterview = (teamId) => {
    navigate(`/interviews/team/${teamId}/view`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Dashboard</h1>
          <p className="text-muted-foreground">
            Conduct and manage interviews for students and teams
          </p>
        </div>
        <Button onClick={() => navigate('/interviews/statistics')}>
          View Statistics
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Interview Students
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Interview Teams
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab === 'students' ? 'students' : 'teams'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <Badge variant="outline">{student.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Department: {student.department?.name || 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInterviewStudent(student._id)}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Interview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewStudentInterview(student._id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found matching your search.
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <Card key={team._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Team {team.teamNumber}</CardTitle>
                    <Badge variant={team.completed ? "default" : "secondary"}>
                      {team.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm font-medium">{team.projectTitle}</div>
                  <div className="text-sm text-muted-foreground">
                    Domain: {team.domain}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Members: {team.students?.length || 0}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInterviewTeam(team._id)}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Interview Team
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTeamInterview(team._id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredTeams.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No teams found matching your search.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 