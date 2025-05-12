import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';
import LoadingModal from '../LoadingModal';
import DeleteModal from '../Shared/DeleteModal'; // Import the DeleteModal component

const API_BASE_URL = 'http://localhost:8000/api'; // Replace with your backend URL

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: 0,
    actual_cost: 0,
    status: 'not_started',
  });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [loading, setLoading] = useState(false); // State to control loading modal visibility
  const [loadingMessage, setLoadingMessage] = useState(''); // State for dynamic loading message
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to control delete modal visibility
  const [deleteTarget, setDeleteTarget] = useState(null); // State to store the target ID for deletion
  const [deleteType, setDeleteType] = useState('projects'); // State to store the type of item to delete

  const navigate = useNavigate();

  // Fetch all projects
  const fetchProjects = async () => {
    setLoadingMessage('Loading projects'); // Set loading message
    setLoading(true); // Show loading modal
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json(); // Parse the JSON response
      setProjects(data); // Update the projects state with the fetched data
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false); // Hide loading modal
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'not_started':
        return 'secondary'; // Gray
      case 'in_progress':
        return 'info'; // Blue
      case 'on_hold':
        return 'warning'; // Yellow
      case 'completed':
        return 'success'; // Green
      case 'cancelled':
        return 'danger'; // Red
      default:
        return 'dark'; // Default color
    }
  };

  const formatStatus = (status) => {
    return status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN';
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Create or update a project
  const handleSubmit = async (updatedFormData) => {
    setLoadingMessage(editingProjectId ? 'Updating project' : 'Creating project');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingProjectId
        ? `${API_BASE_URL}/projects/${editingProjectId}`
        : `${API_BASE_URL}/projects`;
      const method = editingProjectId ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData), // Use the updated formData with the calculated status
      });
  
      if (!response.ok) {
        throw new Error('Failed to save project');
      }
  
      const data = await response.json();
  
      if (editingProjectId) {
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === editingProjectId ? data : project
          )
        );
      } else {
        setProjects((prevProjects) => [...prevProjects, data]);
      }
  
      setShowModal(false);
      setEditingProjectId(null);
      setFormData({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: 0,
        actual_cost: 0,
        status: 'not_started',
      });
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (project) => {
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      budget: project.budget,
      actual_cost: project.actual_cost,
      status: project.status,
    });
    setShowModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setDeleteType('projects');
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteTarget || !deleteType) return;
    setLoadingMessage(`Deleting ${deleteType}`);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/${deleteType}/${deleteTarget}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${deleteType}`);
      }

      if (deleteType === 'projects') {
        setProjects(projects.filter((project) => project.id !== deleteTarget));
      } else if (deleteType === 'tasks') {
        // Handle task deletion logic here
      }

      setShowDeleteModal(false);
    } catch (err) {
      console.error(`Error deleting ${deleteType}:`, err);
      setError(`Failed to delete ${deleteType}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}/`); // Navigate to the ViewTasks page with the project ID
  };

  return (
    <div className="container mt-4">
      <h1>Projects</h1>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            budget: 0,
            actual_cost: 0,
            status: 'not_started',
          }); // Reset the form data
          setEditingProjectId(null); // Clear the editing project ID
          setShowModal(true); // Show the modal
        }}
      >
        Create Project
      </button>

      {projects.length === 0 ? null : (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.id || index}>
                <td>{project.name}</td>
                <td>
                  {project.description?.substring(0, 50)}
                  {project.description?.length > 50 ? '...' : ''}
                </td>
                <td>
                  <span className={`badge bg-${getStatusColor(project.status)}`}>
                    {formatStatus(project.status)}
                  </span>
                </td>
                <td>
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </td>
                <td>{formatCurrency(project.budget)}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleDeleteClick(project.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => handleViewProject(project.id)}
                  >
                    View Project
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Loading Modal */}
      <LoadingModal show={loading} message={loadingMessage} />

      {/* Project Modal */}
      <ProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        editingProjectId={editingProjectId}
        setFormData={setFormData} // Pass setFormData as a prop
      />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        deleteType={deleteType}
      />
    </div>
  );
};

export default Projects;