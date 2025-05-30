import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CarbonReductionGoal } from '../../lib/carbon/models/department-project';
import { CarbonGoalsService } from '../../lib/carbon/carbon-goals-service';
import CarbonGoalCard from './CarbonGoalCard';
import { useAuth } from '../../hooks/useAuth';

interface CarbonGoalTrackerProps {
  organizationId: string;
  departmentId?: string;
  projectId?: string;
}

const CarbonGoalTracker: React.FC<CarbonGoalTrackerProps> = ({
  organizationId,
  departmentId,
  projectId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Array<{
    goal: CarbonReductionGoal;
    currentCarbonInKg: number;
    progressPercentage: number;
  }>>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CarbonReductionGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baselineCarbonInKg: '',
    targetReductionPercentage: '',
    startDate: new Date(),
    targetDate: null as Date | null,
  });

  const goalsService = new CarbonGoalsService();

  useEffect(() => {
    if (organizationId) {
      loadGoals();
    }
  }, [organizationId, departmentId, projectId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsList = await goalsService.getGoals(
        organizationId,
        departmentId,
        projectId,
        'active'
      );

      // Get progress for each goal
      const goalsWithProgress = await Promise.all(
        goalsList.map(async (goal) => {
          const progress = await goalsService.updateGoalProgress(goal.id!);
          return {
            goal: progress.goal,
            currentCarbonInKg: progress.currentCarbonInKg,
            progressPercentage: progress.progressPercentage,
          };
        })
      );

      setGoals(goalsWithProgress);
      setError(null);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError('Failed to load carbon reduction goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal?: CarbonReductionGoal) => {
    if (goal) {
      const startDate = goal.startDate instanceof Date ? 
        goal.startDate : 
        (goal.startDate as any).toDate();
      
      const targetDate = goal.targetDate instanceof Date ? 
        goal.targetDate : 
        (goal.targetDate as any).toDate();

      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description || '',
        baselineCarbonInKg: goal.baselineCarbonInKg.toString(),
        targetReductionPercentage: goal.targetReductionPercentage.toString(),
        startDate,
        targetDate,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        description: '',
        baselineCarbonInKg: '',
        targetReductionPercentage: '',
        startDate: new Date(),
        targetDate: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field: 'startDate' | 'targetDate', date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Goal name is required');
        return;
      }

      if (!formData.baselineCarbonInKg || isNaN(Number(formData.baselineCarbonInKg))) {
        setError('Valid baseline carbon value is required');
        return;
      }

      if (!formData.targetReductionPercentage || 
          isNaN(Number(formData.targetReductionPercentage)) ||
          Number(formData.targetReductionPercentage) <= 0 ||
          Number(formData.targetReductionPercentage) > 100) {
        setError('Target reduction percentage must be between 0 and 100');
        return;
      }

      if (!formData.startDate) {
        setError('Start date is required');
        return;
      }

      if (!formData.targetDate) {
        setError('Target date is required');
        return;
      }

      const baselineCarbonInKg = Number(formData.baselineCarbonInKg);
      const targetReductionPercentage = Number(formData.targetReductionPercentage);
      const targetCarbonInKg = baselineCarbonInKg * (1 - targetReductionPercentage / 100);

      const goalData = {
        name: formData.name,
        description: formData.description || undefined,
        organizationId,
        departmentId,
        projectId,
        baselineCarbonInKg,
        targetCarbonInKg,
        targetReductionPercentage,
        startDate: formData.startDate,
        targetDate: formData.targetDate,
        status: 'active' as const,
      };

      if (editingGoal) {
        await goalsService.updateGoal(editingGoal.id!, goalData);
      } else {
        await goalsService.createGoal(goalData);
      }

      handleCloseDialog();
      loadGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError('Failed to save carbon reduction goal. Please try again.');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Carbon Reduction Goals</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Goal
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : goals.length === 0 ? (
        <Typography>
          No carbon reduction goals found. Create your first goal to start tracking progress.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {goals.map(({ goal, currentCarbonInKg, progressPercentage }) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <CarbonGoalCard
                goal={goal}
                currentCarbonInKg={currentCarbonInKg}
                progressPercentage={progressPercentage}
                onEdit={() => handleOpenDialog(goal)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingGoal ? 'Edit Carbon Reduction Goal' : 'Create Carbon Reduction Goal'}
        </DialogTitle>
        <DialogContent>
          <Box mt={1}>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}
            <TextField
              fullWidth
              margin="normal"
              label="Goal Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description (optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Baseline Carbon"
              name="baselineCarbonInKg"
              type="number"
              value={formData.baselineCarbonInKg}
              onChange={handleInputChange}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">kg CO₂e</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Target Reduction"
              name="targetReductionPercentage"
              type="number"
              value={formData.targetReductionPercentage}
              onChange={handleInputChange}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box mt={2} mb={1}>
                <DatePicker 
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  sx={{ width: '100%' }}
                />
              </Box>
              
              <Box mt={2}>
                <DatePicker 
                  label="Target Date"
                  value={formData.targetDate}
                  onChange={(date) => handleDateChange('targetDate', date)}
                  sx={{ width: '100%' }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingGoal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarbonGoalTracker;
