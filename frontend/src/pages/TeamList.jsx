import { useState } from "react"
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import CheckpointProgressBar from '../components/CheckpointProgressBar';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDataManager } from '../hooks/useDataManager';
import { useDataContext } from '../hooks/useDataContext';
import { RefreshCw } from 'lucide-react';

export default function TeamList() {
  const location = useLocation();
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedTeams, setSelectedTeams] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '', // 'single' or 'bulk'
    teamId: null,
    teamCount: 0
  });

  const { invalidateTeamCache } = useDataContext();

  // Use data manager for teams
  const { 
    data: teams = [], 
    loading, 
    error, 
    updateData: updateTeams,
    refreshData
  } = useDataManager('/teams', {
    cacheKey: `/teams-${location.pathname}` // Unique cache key for this page
  });

  // Use data manager for departments
  const { 
    data: departments = [] 
  } = useDataManager('/departments', {
    cacheKey: 'departments'
  });

  // Always ensure teams is an array
  const teamsArray = Array.isArray(teams) ? teams : [];
  const departmentsArray = Array.isArray(departments) ? departments : [];
  const selectedTeamsArray = Array.isArray(selectedTeams) ? selectedTeams : [];

  // Add a local state for refresh loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add new filter states
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [teamNumberSearch, setTeamNumberSearch] = useState('');

  // Extract unique domains from teams
  const uniqueDomains = Array.from(new Set(teamsArray.map(team => team.domain).filter(Boolean)));

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'notstarted', label: 'Not Started' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Combined filtering logic
  const filteredTeams = teamsArray.filter(team => {
    // Department filter
    if (selectedDept !== 'all') {
      const hasDept = (team.students || []).some(stu => {
        const depId = stu.department?._id || stu.department;
        return depId && depId.toString() === selectedDept;
      });
      if (!hasDept) return false;
    }
    // Domain filter
    if (selectedDomain !== 'all' && team.domain !== selectedDomain) return false;
    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'completed' && !team.completed) return false;
      if (selectedStatus === 'inprogress' && (team.completed || !(team.checkpoints || []).some(cp => cp.completed))) return false;
      if (selectedStatus === 'notstarted' && (team.completed || (team.checkpoints || []).some(cp => cp.completed))) return false;
    }
    // Team number search
    if (teamNumberSearch && team.teamNumber && !team.teamNumber.toString().includes(teamNumberSearch)) return false;
    return true;
  });

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === filteredTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(filteredTeams.map(t => t._id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTeams.length === 0) {
      toast.error('Please select teams to delete');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'bulk',
      teamCount: selectedTeams.length
    });
  };

  const handleDeleteSingle = (teamId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'single',
      teamId
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, teamId } = confirmDialog;
    
    setDeleting(true);
    try {
      if (type === 'single') {
        await api.delete(`/teams/${teamId}`);
        // Update local state immediately
        updateTeams(prevTeams => prevTeams.filter(t => t._id !== teamId));
        setSelectedTeams(prev => prev.filter(id => id !== teamId));
        toast.success('Team deleted successfully');
      } else if (type === 'bulk') {
        const response = await api.delete('/teams', { data: { teamIds: selectedTeams } });
        // Update local state immediately
        updateTeams(prevTeams => prevTeams.filter(t => !selectedTeams.includes(t._id)));
        setSelectedTeams([]);
        toast.success(response.data.message);
      }
      
      // Invalidate related caches
      invalidateTeamCache();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete teams');
    } finally {
      setDeleting(false);
      setConfirmDialog({ isOpen: false, type: '', teamId: null, teamCount: 0 });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ isOpen: false, type: '', teamId: null, teamCount: 0 });
  };

  const getConfirmMessage = () => {
    const { type, teamCount } = confirmDialog;
    if (type === 'single') {
      return 'Are you sure you want to delete this team? This will also delete all students in this team.';
    } else if (type === 'bulk') {
      return `Are you sure you want to delete ${teamCount} team(s)? This will also delete all students in these teams.`;
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-center">Team List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Department</Label>
              {departmentsArray.length > 0 && (
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentsArray.filter(dep => dep && dep._id).map(dep => (
                      <SelectItem key={dep._id} value={dep._id}>{dep.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Domain</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {uniqueDomains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2 self-end"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Selection Controls */}
          {(filteredTeams || []).length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTeamsArray.length === (filteredTeams || []).length && (filteredTeams || []).length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>
                <span className="text-muted-foreground">
                  {selectedTeamsArray.length} of {(filteredTeams || []).length} selected
                </span>
              </div>
              {selectedTeamsArray.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="w-full sm:w-auto"
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedTeamsArray.length} Team(s)`}
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading teams...</div>
          ) : error ? (
            <div className="text-destructive font-medium text-center py-8">{error}</div>
          ) : (filteredTeams || []).length === 0 ? (
            <div className="text-muted-foreground text-center py-8">No teams found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox
                        checked={selectedTeamsArray.length === (filteredTeams || []).length && (filteredTeams || []).length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-center">Team #</TableHead>
                    <TableHead className="text-center">Project Title</TableHead>
                    <TableHead className="text-center">Domain</TableHead>
                    <TableHead className="text-center">Checkpoints</TableHead>
                    <TableHead className="text-center">Details</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredTeams || []).map((team) => (
                    <TableRow key={team._id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedTeamsArray.includes(team._id)}
                          onCheckedChange={() => handleSelectTeam(team._id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-center">{team.teamNumber}</TableCell>
                      <TableCell className="text-center">
                        {team.projectTitle || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {team.domain || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <CheckpointProgressBar
                          checkpoints={team.checkpoints}
                          teamId={team._id}
                          onRefresh={() => {
                            // Update local state when checkpoints change
                            updateTeams(prevTeams => 
                              prevTeams.map(t => 
                                t._id === team._id 
                                  ? { ...t, checkpoints: team.checkpoints }
                                  : t
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/teams/${team._id}`}>View</Link>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSingle(team._id)}
                          disabled={deleting}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title={confirmDialog.type === 'bulk' ? 'Delete Multiple Teams' : 'Delete Team'}
        message={getConfirmMessage()}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  )
}
