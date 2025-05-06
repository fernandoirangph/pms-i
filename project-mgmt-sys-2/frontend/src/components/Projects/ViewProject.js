import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Gantt, ViewMode } from 'gantt-task-react';

const API_BASE_URL = 'http://localhost:8000/api';

const ViewProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const ganttTasks = tasks.map((task) => ({
    id: task.id.toString(),
    name: task.title,
    start: new Date(task.start_date),
    end: new Date(task.end_date),
    progress: task.progress || 0,
    type: 'task',
  }));

  if (loading) return <div>Loading project details...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
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
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned To</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>{task.priority}</td>
                <td>{task.assigned_user?.name || 'Unassigned'}</td>
                <td>{task.start_date ? new Date(task.start_date).toLocaleDateString() : 'No start date'}</td>
                <td>{task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No end date'}</td>
                <td>{task.progress || 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Gantt Chart</h2>
      {tasks.length > 0 ? (
        <div style={{ height: '500px' }}>
          <Gantt tasks={ganttTasks} viewMode={ViewMode.Day} />
        </div>
      ) : (
        <p>No tasks available for Gantt chart.</p>
      )}
    </div>
  );
};

export default ViewProject;