import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function NotCompletedTeams() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data));
  }, []);

  const fetchTeams = (deptId) => {
    setLoading(true);
    api.get('/statistics/incomplete-teams' + (deptId ? `?department=${deptId}` : ''))
      .then(res => setTeams(res.data))
      .catch(() => setError('Failed to fetch teams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeams(selectedDept);
    // eslint-disable-next-line
  }, [selectedDept]);

  return (
    <div className="max-w-5xl mx-auto p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-center">Incomplete Teams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label htmlFor="department-filter" className="font-semibold">Filter by Department:</Label>
            <select
              id="department-filter"
              className="flex h-10 w-full md:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dep => (
                <option key={dep._id} value={dep._id}>{dep.name}</option>
              ))}
            </select>
          </div>
          
          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading teams...</div>
          ) : error ? (
            <div className="text-destructive font-medium text-center py-8">{error}</div>
          ) : teams.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No incomplete teams found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Team #</TableHead>
                    <TableHead className="text-center">Project Title</TableHead>
                    <TableHead className="text-center">Domain</TableHead>
                    <TableHead className="text-center">Checkpoints Ticked</TableHead>
                    <TableHead className="text-center">Departments</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team._id}>
                      <TableCell className="text-center font-medium">{team.teamNumber}</TableCell>
                      <TableCell className="text-center">{team.projectTitle || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-center">{team.domain || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {team.ticked}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {Array.from(new Set((team.students || []).map(stu => stu.department?.name || stu.department))).filter(Boolean).join(', ') || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Link to={`/teams/${team._id}`} className="text-blue-500 hover:text-blue-400 underline">
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="text-center pt-4">
            <Link to="/statistics" className="text-muted-foreground hover:text-foreground underline">
              &larr; Back to Statistics
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 