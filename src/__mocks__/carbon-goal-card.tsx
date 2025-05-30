import React from 'react';
import { CarbonReductionGoal } from '../lib/carbon/types';

// Mock implementation of CarbonGoalCard component
const CarbonGoalCard = ({ goal, onEdit, onDelete }: { 
  goal: CarbonReductionGoal; 
  onEdit?: (goal: CarbonReductionGoal) => void; 
  onDelete?: (goalId: string) => void;
}) => {
  return (
    <div data-testid="carbon-goal-card">
      <h3>{goal.title}</h3>
      <p>Target: {goal.targetValue} kg CO2e</p>
      <p>Baseline: {goal.baselineValue} kg CO2e</p>
      <p>Target Date: {goal.targetDate.toLocaleDateString()}</p>
      {onEdit && (
        <button onClick={() => onEdit(goal)} data-testid="edit-goal-button">
          Edit
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(goal.id)} data-testid="delete-goal-button">
          Delete
        </button>
      )}
    </div>
  );
};

export default CarbonGoalCard;
