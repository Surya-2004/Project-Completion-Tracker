import { useEffect, useState } from "react"
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

const CHECKPOINTS = [
  { key: "ideation", label: "Ideation" },
  { key: "workSplit", label: "Work Split" },
  { key: "localProjectDone", label: "Local Done" },
  { key: "projectHosted", label: "Hosted" },
]

function CheckpointLine({ checkpoints, onToggle, disabled }) {
  return (
    <div className="space-y-2">
      {/* Checkboxes */}
      <div className="flex items-center justify-between">
        {CHECKPOINTS.map((cp) => {
          const isCompleted = checkpoints?.[cp.key]
          return (
            <button
              key={cp.key}
              onClick={() => onToggle(cp.key)}
              disabled={disabled}
              className={`
                w-8 h-8 flex items-center justify-center border-2 rounded-md transition-all duration-150
                ${
                  isCompleted
                    ? "bg-green-500 border-green-500 hover:bg-green-600"
                    : "bg-neutral-800 border-neutral-600 hover:border-green-400"
                }
                ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
              `}
            >
              {isCompleted && (
                <Check className="w-4 h-4 text-white" />
              )}
            </button>
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex items-start justify-between">
        {CHECKPOINTS.map((cp) => (
          <div key={cp.key} className="flex flex-col items-center" style={{ width: "32px" }}>
            <span className="text-xs text-neutral-300 text-center leading-tight whitespace-nowrap">{cp.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TeamList() {
  const [teams, setTeams] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState({}) // { [teamId]: boolean }
  const [updateError, setUpdateError] = useState({}) // { [teamId]: string }
  const [selectedTeams, setSelectedTeams] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '', // 'single' or 'bulk'
    teamId: null,
    teamCount: 0
  });

  useEffect(() => {
    api.get('/departments').then(res => setDepartments(res.data)).catch(() => setDepartments([]));
  }, [])

  const fetchTeams = () => {
    setLoading(true)
    api.get('/teams')
      .then(res => setTeams(res.data))
      .catch(() => setError('Failed to fetch teams'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const filteredTeams = selectedDept
    ? teams.filter(team =>
        (team.students || []).some(stu => {
          const depId = stu.department?._id || stu.department
          return depId && depId.toString() === selectedDept
        })
      )
    : teams

  // Contiguous checkpoint logic for real teams
  const handleCheckpointChange = async (teamId, checkpoint) => {
    const team = teams.find(t => t._id === teamId)
    if (!team) return
    const idx = CHECKPOINTS.findIndex(cp => cp.key === checkpoint)
    const isChecked = team.checkpoints?.[checkpoint]
    let newCheckpoints = { ...team.checkpoints }
    if (!isChecked) {
      // Check this and all previous
      for (let i = 0; i <= idx; i++) {
        newCheckpoints[CHECKPOINTS[i].key] = true
      }
    } else {
      // Uncheck this and all after
      for (let i = idx; i < CHECKPOINTS.length; i++) {
        newCheckpoints[CHECKPOINTS[i].key] = false
      }
    }
    setUpdating(u => ({ ...u, [teamId]: true }))
    setUpdateError(e => ({ ...e, [teamId]: '' }))
    // Optimistically update UI
    setTeams(ts => ts.map(t => t._id === teamId ? { ...t, checkpoints: newCheckpoints } : t))
    try {
      const res = await api.patch(`/teams/${teamId}/checkpoints`, newCheckpoints)
      setTeams(ts => ts.map(t => t._id === teamId ? res.data : t))
    } catch {
      setUpdateError(e => ({ ...e, [teamId]: 'Failed to update' }))
      // Revert UI
      setTeams(ts => ts.map(t => t._id === teamId ? { ...t, checkpoints: team.checkpoints } : t))
    } finally {
      setUpdating(u => ({ ...u, [teamId]: false }))
    }
  }

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
        setTeams(teams => teams.filter(t => t._id !== teamId));
        setSelectedTeams(prev => prev.filter(id => id !== teamId));
        toast.success('Team deleted successfully');
      } else if (type === 'bulk') {
        const response = await api.delete('/teams', { data: { teamIds: selectedTeams } });
        setTeams(teams => teams.filter(t => !selectedTeams.includes(t._id)));
        setSelectedTeams([]);
        toast.success(response.data.message);
      }
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
    <div className="max-w-7xl mx-auto bg-neutral-900 p-10 rounded-2xl shadow-2xl border border-neutral-800 mt-8">
      <h2 className="text-3xl font-extrabold mb-8 text-white tracking-tight text-center">Team List</h2>
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <label className="text-neutral-200 font-semibold">Filter by Department:</label>
        <select
          className="border border-neutral-700 bg-neutral-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition w-64"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dep => (
            <option key={dep._id} value={dep._id}>{dep.name}</option>
          ))}
        </select>
      </div>

      {/* Selection Controls */}
      {filteredTeams.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-neutral-800 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-neutral-200">
              <input
                type="checkbox"
                checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              Select All
            </label>
            <span className="text-neutral-400">
              {selectedTeams.length} of {filteredTeams.length} selected
            </span>
          </div>
          {selectedTeams.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {deleting ? 'Deleting...' : `Delete ${selectedTeams.length} Team(s)`}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-neutral-400">Loading teams...</div>
      ) : error ? (
        <div className="text-red-400 font-medium">{error}</div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-neutral-400">No teams found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 rounded-xl overflow-hidden shadow">
            <thead>
              <tr className="bg-neutral-800">
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200 w-12">
                  <input
                    type="checkbox"
                    checked={selectedTeams.length === filteredTeams.length && filteredTeams.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Team #</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Project Title</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Domain</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Checkpoints</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Completed</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Details</th>
                <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, idx) => (
                <tr key={team._id} className={`transition hover:bg-neutral-800 ${idx % 2 === 0 ? 'bg-neutral-900' : 'bg-neutral-950'}`}>
                  <td className="px-4 py-2 border border-neutral-800 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team._id)}
                      onChange={() => handleSelectTeam(team._id)}
                      className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-center text-white">{team.teamNumber}</td>
                  <td className="px-4 py-2 border border-neutral-800 text-white">{team.projectTitle || <span className="text-neutral-500">—</span>}</td>
                  <td className="px-4 py-2 border border-neutral-800 text-white">{team.domain || <span className="text-neutral-500">—</span>}</td>
                  <td className="px-4 py-2 border border-neutral-800 text-center">
                    <CheckpointLine
                      checkpoints={team.checkpoints}
                      onToggle={cp => handleCheckpointChange(team._id, cp)}
                      disabled={updating[team._id]}
                    />
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-center">
                    {team.completed ? <span className="text-green-400 font-bold">✔</span> : <span className="text-neutral-500">—</span>}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-center">
                    <a href={`/teams/${team._id}`} className="text-gray-300 hover:underline">View</a>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800 text-center">
                    <button
                      onClick={() => handleDeleteSingle(team._id)}
                      className="text-red-400 hover:text-red-300 underline text-sm"
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.entries(updateError).map(([teamId, msg]) => msg && (
            <div key={teamId} className="text-red-400 font-medium mt-2">Team #{teams.find(t => t._id === teamId)?.teamNumber}: {msg}</div>
          ))}
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Team(s)"
        message={getConfirmMessage()}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
