import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DomainBarChart from '../components/DomainBarChart';
import DepartmentStatsTable from '../components/DepartmentStatsTable';
import DepartmentCompletionBarChart from '../components/DepartmentCompletionBarChart';
import CombinedCompletionBarChart from '../components/CombinedCompletionBarChart';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Building2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const icons = {
  students: <Users className="w-8 h-8" />,
  teams: <Plus className="w-8 h-8" />,
  departments: <Building2 className="w-8 h-8" />,
  completed: <CheckCircle className="w-8 h-8" />,
  incomplete: <XCircle className="w-8 h-8" />,
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
      
      <div className="grid md:grid-cols-2 gap-8">
        <DomainBarChart data={stats.studentsPerDomain} />
        <DepartmentStatsTable stats={stats.departmentStats} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <DepartmentCompletionBarChart data={deptCompletion} />
        <CombinedCompletionBarChart completed={stats.completedProjects} notCompleted={stats.incompleteProjects} />
      </div>
      
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
