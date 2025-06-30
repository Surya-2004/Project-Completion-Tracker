import { useState } from 'react';
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
import { useDataManager } from '../hooks/useDataManager';

export default function CompletedTeams() {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [teamNumberSearch, setTeamNumberSearch] = useState('');

  // Use data manager for departments
  const { 
    data: departments = [] 
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Use data manager for completed teams
  const { 
    data: teams = [], 
    loading, 
    error 
  } = useDataManager('/statistics/completed-teams' + (selectedDept ? `?department=${selectedDept}` : ''), {
    cacheKey: `completed-teams-${selectedDept}`
  });

  // Ensure arrays are safe
  const teamsArray = Array.isArray(teams) ? teams : [];
  const departmentsArray = Array.isArray(departments) ? departments : [];

  // Extract unique domains from teams
  const uniqueDomains = Array.from(new Set(teamsArray.map(team => team.domain).filter(Boolean)));

  // Combined filtering logic
  const filteredTeams = teamsArray.filter(team => {
    // Domain filter
    if (selectedDomain !== 'all' && team.domain !== selectedDomain) return false;
    // Team number search
    if (teamNumberSearch && team.teamNumber && !team.teamNumber.toString().includes(teamNumberSearch)) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">Completed Teams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <Label htmlFor="department-filter" className="font-semibold">Department</Label>
              <select
                id="department-filter"
                className="flex h-10 w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departmentsArray.map(dep => (
                  <option key={dep._id} value={dep._id}>{dep.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Domain</Label>
              <select
                className="flex h-10 w-full md:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
              >
                <option value="all">All Domains</option>
                {uniqueDomains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Team Number</Label>
              <input
                type="text"
                value={teamNumberSearch}
                onChange={e => setTeamNumberSearch(e.target.value)}
                placeholder="Search Team #"
                className="flex h-10 w-full md:w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading teams...</div>
          ) : error ? (
            <div className="text-destructive font-medium text-center py-8">{error}</div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No completed teams found.</div>
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
                  {filteredTeams.map((team) => (
                    <TableRow key={team._id}>
                      <TableCell className="text-center font-medium">{team.teamNumber}</TableCell>
                      <TableCell className="text-center">{team.projectTitle || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-center">{team.domain || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 w-full">
                            {team.ticked || 0}
                          </Badge>
                        </div>
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