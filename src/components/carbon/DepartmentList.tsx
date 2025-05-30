import React, { useState, useEffect } from 'react';
import { Department } from '../../lib/carbon/models/department-project';
import { DepartmentProjectService } from '../../lib/carbon/department-project-service';
import {
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface DepartmentListProps {
  organizationId: string;
  onSelectDepartment?: (department: Department) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ organizationId, onSelectDepartment }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headCount: '',
  });
  const [error, setError] = useState<string | null>(null);

  const departmentService = new DepartmentProjectService();

  useEffect(() => {
    if (organizationId) {
      loadDepartments();
    }
  }, [organizationId]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const departmentsList = await departmentService.getDepartments(organizationId);
      setDepartments(departmentsList);
      setError(null);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || '',
        headCount: department.headCount?.toString() || '',
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        description: '',
        headCount: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Department name is required');
        return;
      }

      const headCount = formData.headCount ? parseInt(formData.headCount) : undefined;

      if (editingDepartment) {
        // Update existing department
        await departmentService.updateDepartment(editingDepartment.id!, {
          name: formData.name,
          description: formData.description || undefined,
          headCount: isNaN(headCount!) ? undefined : headCount,
        });
      } else {
        // Create new department
        await departmentService.createDepartment({
          name: formData.name,
          description: formData.description || undefined,
          headCount: isNaN(headCount!) ? undefined : headCount,
          organizationId,
        });
      }

      handleCloseDialog();
      loadDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      setError('Failed to save department. Please try again.');
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await departmentService.deleteDepartment(departmentId);
        loadDepartments();
      } catch (err) {
        console.error('Error deleting department:', err);
        alert('Failed to delete department. It may have associated projects.');
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Departments</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Department
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : departments.length === 0 ? (
          <Typography>No departments found. Create your first department to get started.</Typography>
        ) : (
          <List>
            {departments.map((department) => (
              <React.Fragment key={department.id}>
                <ListItem button onClick={() => onSelectDepartment && onSelectDepartment(department)}>
                  <ListItemText
                    primary={department.name}
                    secondary={
                      <>
                        {department.description && (
                          <Typography variant="body2" component="span">
                            {department.description}
                          </Typography>
                        )}
                        {department.headCount && (
                          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                            • {department.headCount} team members
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleOpenDialog(department)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDeleteDepartment(department.id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
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
              label="Department Name"
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
              label="Team Members (optional)"
              name="headCount"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.headCount}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingDepartment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DepartmentList;
