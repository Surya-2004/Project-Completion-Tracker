import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import api from '../services/api';
import toast from 'react-hot-toast';

const CheckpointProgressBar = ({ checkpoints: propCheckpoints, teamId, onRefresh }) => {
  // Always work with an array
  const initialCheckpoints = Array.isArray(propCheckpoints) ? propCheckpoints : [];
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  const [updating, setUpdating] = useState(false);

  // Sync with parent prop if it changes
  React.useEffect(() => {
    setCheckpoints(Array.isArray(propCheckpoints) ? propCheckpoints : []);
  }, [propCheckpoints]);

  if (!checkpoints || checkpoints.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const handleCheckpointClick = async (index) => {
    if (updating) return; // Prevent double clicks
    setUpdating(true);

    const currentCheckpoint = checkpoints[index];
    const newCompleted = !currentCheckpoint.completed;
    const newCheckpoints = checkpoints.map((cp, i) => {
      if (newCompleted && i <= index) return { ...cp, completed: true };
      if (!newCompleted && i >= index) return { ...cp, completed: false };
      return cp;
    });

    // Optimistically update UI
    setCheckpoints(newCheckpoints);

    // Prepare updates array for bulk operation
    const updates = [];
    if (newCompleted) {
      for (let i = 0; i <= index; i++) {
        if (!checkpoints[i].completed) {
          updates.push({ index: i, completed: true });
        }
      }
    } else {
      for (let i = index; i < checkpoints.length; i++) {
        if (checkpoints[i].completed) {
          updates.push({ index: i, completed: false });
        }
      }
    }
    if (updates.length === 0) {
      setUpdating(false);
      return;
    }

    try {
      await api.patch(`/teams/${teamId}/checkpoints/bulk`, { updates });
      toast.success('Checkpoints updated successfully');
      if (onRefresh) onRefresh();
    } catch {
      setCheckpoints(checkpoints);
      toast.error('Failed to update checkpoints');
    } finally {
      setUpdating(false);
    }
  };

  const completedCount = (checkpoints || []).filter(cp => cp.completed).length;
  const progressPercentage = checkpoints.length > 0 ? (completedCount / checkpoints.length) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      {/* Progress Text */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{completedCount} of {checkpoints.length} completed</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      {/* Checkpoints List */}
      <div className="space-y-1">
        {(checkpoints || []).map((checkpoint, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox
              checked={!!checkpoint.completed}
              onCheckedChange={() => handleCheckpointClick(index)}
              disabled={updating}
            />
            <span className={`text-sm ${checkpoint.completed ? 'line-through text-muted-foreground' : ''}`}>
              {checkpoint.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckpointProgressBar; 