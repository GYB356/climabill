import React, { useState, useEffect } from 'react';
import { Project, Department } from '../../lib/carbon/models/department-project';
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
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '../../hooks/useAuth';

interface ProjectListProps {
  organizationId: string;
  departmentId?: string;
  onSelectProject?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ organizationId, departmentId, onSelectProject }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    status: 'active' as 'active' | 'completed' | 'archived',
    startDate: new Date(),
    endDate: null as Date | null,
  });
  const [error, setError] = useState<string | null>(null);

  const service = new DepartmentProjectService();

  useEffect(() => {
    if (organizationId) {
      loadProjects();
      loadDepartments();
    }
  }, [organizationId, departmentId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsList = await service.getProjects(organizationId, departmentId);
      setProjects(projectsList);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const departmentsList = await service.getDepartments(organizationId);
      setDepartments(departmentsList);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      // Convert Firestore timestamps to Date objects if needed
      const startDate = project.startDate instanceof Date ? 
        project.startDate : 
        (project.startDate as any).toDate();
      
      const endDate = project.endDate instanceof Date ? 
        project.endDate : 
        project.endDate ? (project.endDate as any).toDate() : null;
      
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || '',
        departmentId: project.departmentId || '',
        status: project.status,
        startDate,
        endDate,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        departmentId: departmentId || '',
        status: 'active',
        startDate: new Date(),
        endDate: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Project name is required');
        return;
      }

      if (!formData.startDate) {
        setError('Start date is required');
        return;
      }

      // If end date is provided, ensure it's after start date
      if (formData.endDate && formData.startDate > formData.endDate) {
        setError('End date must be after start date');
        return;
      }

      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        organizationId,
        departmentId: formData.departmentId || undefined,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      };

      if (editingProject) {
        // Update existing project
        await service.updateProject(editingProject.id!, projectData);
      } else {
        // Create new project
        await service.createProject(projectData);
      }

      handleCloseDialog();
      loadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await service.deleteProject(projectId);
        loadProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4caf50'; // green
      case 'completed':
        return '#2196f3'; // blue
      case 'archived':
        return '#9e9e9e'; // grey
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Projects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Project
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : projects.length === 0 ? (
          <Typography>No projects found. Create your first project to get started.</Typography>
        ) : (
          <List>
            {projects.map((project) => {
              const department = departments.find(d => d.id === project.departmentId);
              return (
                <React.Fragment key={project.id}>
                  <ListItem button onClick={() => onSelectProject && onSelectProject(project)}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1">{project.name}</Typography>
                          <Chip 
                            size="small" 
                            label={project.status} 
                            sx={{ 
                              ml: 1, 
                              backgroundColor: getStatusColor(project.status),
                              color: 'white'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {department && (
                            <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                              Department: {department.name} •
                            </Typography>
                          )}
                          {project.description && (
                            <Typography variant="body2" component="span">
                              {project.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(project);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id!);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
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
              label="Project Name"
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
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                label="Department"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
              >
                <MenuItem value="">None</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            
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
                  label="End Date (optional)"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  sx={{ width: '100%' }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProjectList;
