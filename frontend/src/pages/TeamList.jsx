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

  // Use data manager for teams with force refresh on navigation
  const { 
    data: teams = [], 
    loading, 
    error, 
    updateData: updateTeams 
  } = useDataManager('/teams', {
    forceRefresh: true, // Force refresh when navigating to this page
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

  const filteredTeams = selectedDept === 'all'
    ? teamsArray
    : teamsArray.filter(team =>
        (team.students || []).some(stu => {
          const depId = stu.department?._id || stu.department
          return depId && depId.toString() === selectedDept
        })
      );

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
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-semibold">Filter by Department:</Label>
            {departmentsArray.length > 0 && (
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-full md:w-64">
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
