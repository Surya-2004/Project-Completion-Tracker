import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import api from '../services/api';
import toast from 'react-hot-toast';

const CheckpointProgressBar = ({ checkpoints, teamId, onRefresh }) => {
  if (!checkpoints || checkpoints.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const handleCheckpointClick = async (index) => {
    const currentCheckpoint = checkpoints[index];
    const newCompleted = !currentCheckpoint.completed;
    
    // Prepare updates array for bulk operation
    const updates = [];
    
    // If checking a checkpoint, also check all previous ones
    if (newCompleted) {
      for (let i = 0; i <= index; i++) {
        if (!checkpoints[i].completed) {
          updates.push({ index: i, completed: true });
        }
      }
    } else {
      // If unchecking a checkpoint, also uncheck all subsequent ones
      for (let i = index; i < checkpoints.length; i++) {
        if (checkpoints[i].completed) {
          updates.push({ index: i, completed: false });
        }
      }
    }
    
    if (updates.length === 0) return;
    
    try {
      // Call the bulk update endpoint
      await api.patch(`/teams/${teamId}/checkpoints/bulk`, { updates });
      
      // Refresh the parent component's data
      if (onRefresh) {
        onRefresh();
      }
      
      toast.success('Checkpoints updated successfully');
    } catch (error) {
      console.error('Error updating checkpoints:', error);
      toast.error('Failed to update checkpoints');
    }
  };

  const completedCount = checkpoints.filter(cp => cp.completed).length;
  const progressPercentage = (completedCount / checkpoints.length) * 100;

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
        {checkpoints.map((checkpoint, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox
              checked={checkpoint.completed}
              onCheckedChange={() => handleCheckpointClick(index)}
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