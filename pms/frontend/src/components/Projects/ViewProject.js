import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'gantt-task-react/dist/index.css';
import { Gantt, ViewMode } from 'gantt-task-react';
import DeleteModal from '../Modals/DeleteModal';

const API_BASE_URL = 'http://localhost:8000/api';

const ViewProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project details');
        }

        const data = await response.json();
        setProject(data.project);
        setTasks(data.tasks);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const calculateRemainingBudget = () => {
    if (!project) return 0;
    return project.budget - project.actual_cost;
  };

  const handleCreateTask = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
      } else {
        console.error('Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updatedTaskData = await response.json();
        setTasks(tasks.map((task) => (task.id === taskId ? updatedTaskData : task)));
      } else {
        console.error('Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteClick = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteItem) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/${deleteItem.type}/${deleteItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          if (deleteItem.type === 'tasks') {
            setTasks(tasks.filter((task) => task.id !== deleteItem.id));
          } else if (deleteItem.type === 'projects') {
            navigate('/projects');
          }
        } else {
          console.error('Failed to delete item');
        }
      } catch (err) {
        console.error('Error deleting item:', err);
      } finally {
        setShowDeleteModal(false);
        setDeleteItem(null);
      }
    }
  };

  const sortedTasks = tasks.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const ganttTasks = sortedTasks.map((task) => ({
    id: task.id.toString(), // Ensure the ID is a string
    name: task.name,
    start: task.start_date ? new Date(task.start_date) : new Date(), // Default to current date if missing
    end: task.end_date ? new Date(task.end_date) : new Date(), // Default to current date if missing
    progress: task.progress || 20, // Default progress to 0 if missing
    type: 'task', // Set the type to 'task'
    styles: { progressColor: getTaskStatusColor(task.status), progressSelectedColor: getTaskStatusColor(task.status) },
  }));

  if (loading) return <div>Loading project details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Project Details</h1>
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        Back to Projects
      </button>

      {project && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{project.name}</h5>
            <p className="card-text">{project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Start Date:</strong> {new Date(project.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(project.end_date).toLocaleDateString()}</p>
            <p><strong>Budget:</strong> ₱{project.budget ? project.budget.toLocaleString() : 'N/A'}</p>
            <p><strong>Actual Cost:</strong> ₱{project.actual_cost ? project.actual_cost.toLocaleString() : 'N/A'}</p>
            <p><strong>Remaining Budget:</strong> ₱{calculateRemainingBudget() ? calculateRemainingBudget().toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      )}

      <h2>Resource Allocation</h2>
      {tasks.length === 0 ? (
        <p>No tasks found for this project.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Estimated Hours</th>
              <th>Actual Hours</th>
              <th>Assigned To</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.priority}</td>
                <td>{task.estimated_hours}</td>
                <td>{task.actual_hours}</td>
                <td>{task.team_member_ids ? `[${task.team_member_ids.join(', ')}]` : 'Unassigned'}</td>
                <td>{task.start_date ? new Date(task.start_date).toLocaleDateString() : 'No start date'}</td>
                <td>{task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No end date'}</td>
                <td>
                  <button className="btn btn-primary btn-sm me-2" onClick={() => handleUpdateTask(task.id, { ...task, name: 'Updated Task Name' })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick({ id: task.id, type: 'tasks' })}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Gantt Chart</h2>
      {tasks.length > 0 ? (
        <div style={{ height: '500px'}}>
          <Gantt tasks={ganttTasks} viewMode={ViewMode.Day} />
        </div>
      ) : (
        <p>No tasks available for Gantt chart.</p>
      )}

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onDelete={confirmDelete}
        itemName={deleteItem?.type === 'tasks' ? 'this task' : 'this project'}
      />
    </div>
  );
};

const getTaskStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'not_started':
      return 'secondary'; // Gray
    case 'in_progress':
      return 'info'; // Blue
    case 'review':
      return 'warning'; // Yellow
    case 'completed':
      return 'success'; // Green
    default:
      return 'dark'; // Default color
  }
};

export default ViewProject;