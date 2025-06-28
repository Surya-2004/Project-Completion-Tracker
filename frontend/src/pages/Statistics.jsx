import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DepartmentStatsTable from '../components/DepartmentStatsTable';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Building2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const icons = {
  students: <Users className="w-8 h-8" />,
  teams: <Plus className="w-8 h-8" />,
  departments: <Building2 className="w-8 h-8" />,
  completed: <CheckCircle className="w-8 h-8" />,
  incomplete: <XCircle className="w-8 h-8" />,
  bar: <BarChart3 className="w-8 h-8" />,
};

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deptCompletion, setDeptCompletion] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/statistics')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to fetch statistics'));
    api.get('/statistics/department-completion')
      .then(res => setDeptCompletion(res.data))
      .catch(() => setDeptCompletion([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Card className="max-w-4xl mx-auto p-8">
      <CardContent>
        <p className="text-muted-foreground">Loading statistics...</p>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="max-w-4xl mx-auto p-8">
      <CardContent>
        <p className="text-destructive font-medium">{error}</p>
      </CardContent>
    </Card>
  );
  
  if (!stats) return null;

  // Prepare domain stats for shadcn/ui display
  const domainStats = Object.entries(stats.studentsPerDomain || {}).map(([domain, count]) => ({ domain, count }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Statistics</CardTitle>
          <p className="text-muted-foreground">Visual insights into team, domain, and department progress</p>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Students" value={stats.totalStudents} icon={icons.students} />
        <StatCard label="Total Teams" value={stats.totalTeams} icon={icons.teams} />
        <StatCard label="Total Departments" value={stats.totalDepartments} icon={icons.departments} />
        <StatCard label="Completed Projects" value={stats.completedProjects} icon={icons.completed} />
      </div>

      {/* Domain Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Students per Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {domainStats.length === 0 ? (
              <span className="text-muted-foreground">No domain data</span>
            ) : (
              domainStats.map(({ domain, count }) => (
                <div key={domain} className="flex flex-col items-center p-4 bg-muted rounded-lg min-w-[120px]">
                  <span className="font-semibold text-lg text-foreground">{count}</span>
                  <span className="text-muted-foreground text-sm mt-1">{domain}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Department Stats Table (already shadcn/ui) */}
      <DepartmentStatsTable stats={stats.departmentStats} />

      {/* Department Completion Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {deptCompletion.length === 0 ? (
              <span className="text-muted-foreground">No department completion data</span>
            ) : (
              deptCompletion.map(({ department, completionRate }) => (
                <div key={department} className="flex flex-col items-center p-4 bg-muted rounded-lg min-w-[140px]">
                  <span className="font-semibold text-lg text-foreground">{completionRate}%</span>
                  <span className="text-muted-foreground text-sm mt-1">{department}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Project Completion Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Project Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg min-w-[160px]">
              <span className="font-semibold text-2xl text-green-500">{stats.completedProjects}</span>
              <span className="text-muted-foreground text-sm mt-1">Completed</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg min-w-[160px]">
              <span className="font-semibold text-2xl text-red-500">{stats.incompleteProjects}</span>
              <span className="text-muted-foreground text-sm mt-1">Not Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <button
          className="w-full"
          onClick={() => navigate('/teams/incomplete')}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <StatCard label="Incomplete Projects" value={stats.incompleteProjects} icon={icons.incomplete} />
        </button>
        <button
          className="w-full"
          onClick={() => navigate('/teams/completed')}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <StatCard label="Completed Projects" value={stats.completedProjects} icon={icons.completed} />
        </button>
      </div>
    </div>
  );
}
