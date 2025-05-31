import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { CarbonReductionGoal } from '../../lib/carbon/models/department-project';

interface CarbonGoalCardProps {
  goal: CarbonReductionGoal;
  currentCarbonInKg: number;
  progressPercentage: number;
  onEdit?: () => void;
}

const CarbonGoalCard: React.FC<CarbonGoalCardProps> = ({
  goal,
  currentCarbonInKg,
  progressPercentage,
  onEdit
}) => {
  // Helper function to format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'achieved':
        return '#2196f3';
      case 'missed':
        return '#f44336';
      case 'archived':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  // Helper function to format carbon values
  const formatCarbon = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tonnes CO₂e`;
    }
    return `${kg.toFixed(1)} kg CO₂e`;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {goal.name}
            </Typography>
            <Chip
              label={goal.status}
              size="small"
              sx={{
                backgroundColor: getStatusColor(goal.status),
                color: 'white',
                mr: 1
              }}
            />
            <Chip
              label={`Target: ${goal.targetReductionPercentage}% reduction`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          {onEdit && (
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Progress towards target
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Box flexGrow={1} mr={2}>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressPercentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progressPercentage >= 100 ? '#4caf50' : '#2196f3'
                  }
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {progressPercentage.toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <List dense>
          <ListItem>
            <ListItemText
              primary="Baseline Carbon"
              secondary={formatCarbon(goal.baselineCarbonInKg)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Current Carbon"
              secondary={formatCarbon(currentCarbonInKg)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Target Carbon"
              secondary={formatCarbon(goal.targetCarbonInKg)}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Timeline"
              secondary={`${formatDate(goal.startDate as Date)} - ${formatDate(goal.targetDate as Date)}`}
            />
          </ListItem>
        </List>

        {goal.milestones && goal.milestones.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Milestones
            </Typography>
            <List dense>
              {goal.milestones.map((milestone, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={milestone.name}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {formatCarbon(milestone.targetCarbonInKg)} by {formatDate(milestone.targetDate as Date)}
                        </Typography>
                        {milestone.achieved && (
                          <Chip
                            label="Achieved"
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {goal.description && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              {goal.description}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CarbonGoalCard;
