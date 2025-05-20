import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../App';
import { Modal, Button, Form, Nav, Tab, Alert } from 'react-bootstrap';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import TeamMembers from './TeamMembers';
import Budgets from './Budgets';
import ProjectDetails from './ProjectDetails';

function ProjectTable() {
    const { token } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTasksModal, setShowTasksModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [projectTasks, setProjectTasks] = useState([]);
    const [projectBudgets, setProjectBudgets] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [tasksError, setTasksError] = useState(null);
    const [statusPreview, setStatusPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'Not Started',
        budget: '',
    });

    const projectStatuses = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch user');
            const data = await response.json();
            setUser(data);
        } catch (e) {
            console.error('Failed to fetch user:', e);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProjects(data);
        } catch (e) {
            console.error("Failed to fetch projects:", e);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchProjectTasks = useCallback(async (projectId) => {
        setTasksLoading(true);
        setTasksError(null);
        try {
            const [tasksResponse, budgetsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                }),
                fetch(`${API_BASE_URL}/projects/${projectId}/budgets`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                }),
            ]);

            const tasksData = await tasksResponse.json();
            const budgetsData = await budgetsResponse.json();

            if (!tasksResponse.ok) {
                throw new Error(tasksData.message || `Tasks fetch failed: ${tasksResponse.status}`);
            }
            if (!budgetsResponse.ok) {
                throw new Error(budgetsData.message || `Budgets fetch failed: ${budgetsResponse.status}`);
            }

            setProjectTasks(tasksData);
            setProjectBudgets(budgetsData);
        } catch (e) {
            console.error("Failed to fetch project tasks or budgets:", e);
            setTasksError(`Failed to load tasks or budgets: ${e.message}`);
        } finally {
            setTasksLoading(false);
        }
    }, [token]);

    const handleBudgetAdded = useCallback((newBudget) => {
        setProjectBudgets(prev => {
            const updatedBudgets = [...prev, newBudget];
            return updatedBudgets;
        });
    }, []);

    useEffect(() => {
        fetchProjects();
        const intervalId = setInterval(() => {
            fetchProjects();
        }, 60000);
        return () => clearInterval(intervalId);
    }, [fetchProjects]);

    const handleShowCreateModal = () => {
        setIsEditing(false);
        setCurrentProject(null);
        setFormData({
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            status: 'Not Started',
            budget: '',
        });
        setStatusPreview(null);
        setShowModal(true);
    };

    const handleShowEditModal = (project) => {
        setIsEditing(true);
        setCurrentProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            start_date: project.start_date ? project.start_date.split('T')[0] : '',
            end_date: project.end_date ? project.end_date.split('T')[0] : '',
            status: project.status,
            budget: project.budget || '',
        });
        updateStatusPreview({
            start_date: project.start_date ? project.start_date.split('T')[0] : '',
            end_date: project.end_date ? project.end_date.split('T')[0] : '',
        });
        setShowModal(true);
    };

    const handleShowTasksModal = async (project) => {
        setCurrentProject(project);
        await fetchProjectTasks(project.id);
        setShowTasksModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentProject(null);
        setError(null);
        setStatusPreview(null);
    };

    const handleCloseTasksModal = () => {
        setShowTasksModal(false);
        setProjectTasks([]);
        setProjectBudgets([]);
        setCurrentProject(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'start_date' || name === 'end_date') {
            updateStatusPreview({
                ...formData,
                [name]: value,
            });
        }
    };

    const updateStatusPreview = (data) => {
        const dateData = data || formData;
        if (!dateData.start_date && !dateData.end_date) {
            setStatusPreview(null);
            return;
        }
        const now = new Date();
        const startDate = dateData.start_date ? new Date(dateData.start_date) : null;
        const endDate = dateData.end_date ? new Date(dateData.end_date) : null;
        let computedStatus = dateData.status;
        if (startDate && endDate) {
            if (now < startDate) {
                computedStatus = 'Not Started';
            } else if (now > endDate) {
                computedStatus = 'Completed';
            } else {
                computedStatus = 'In Progress';
            }
        } else if (startDate && !endDate) {
            if (now < startDate) {
                computedStatus = 'Not Started';
            } else {
                computedStatus = 'In Progress';
            }
        } else if (!startDate && endDate) {
            if (now > endDate) {
                computedStatus = 'Completed';
            } else {
                computedStatus = 'In Progress';
            }
        }
        setStatusPreview(computedStatus);
    };

    useEffect(() => {
        updateStatusPreview();
    }, [formData.start_date, formData.end_date]);

    // --- Dynamic Status Logic ---
    useEffect(() => {
        if (formData.status === 'On Hold') return; // Allow manual 'On Hold'
        const today = new Date();
        const start = formData.start_date ? new Date(formData.start_date) : null;
        const end = formData.end_date ? new Date(formData.end_date) : null;
        let newStatus = formData.status;
        if (start && end) {
            if (today < start) {
                newStatus = 'Not Started';
            } else if (today >= start && today <= end) {
                newStatus = 'In Progress';
            } else if (today > end) {
                newStatus = 'Completed';
            }
            if (formData.status !== newStatus) {
                setFormData(f => ({ ...f, status: newStatus }));
            }
        }
    }, [formData.start_date, formData.end_date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation: start_date should not be later than end_date
        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            setError('Start date cannot be later than end date.');
            return;
        }
        setError(null);
        const url = isEditing
            ? `${API_BASE_URL}/projects/${currentProject.id}`
            : `${API_BASE_URL}/projects`;
        const method = isEditing ? 'PUT' : 'POST';
        if (!formData.name.trim()) {
            setError('Project name cannot be empty.');
            return;
        }
        if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
            setError('End date cannot be before start date.');
            return;
        }
        if (formData.budget && isNaN(parseFloat(formData.budget))) {
            setError('Budget must be a valid number.');
            return;
        }
        const payload = { ...formData };
        if (statusPreview) {
            payload.status = statusPreview;
        }
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            fetchProjects();
            handleCloseModal();
        } catch (e) {
            console.error('Failed to save project:', e);
            setError(`Failed to save project: ${e.message}`);
        }
    };

    const handleDelete = async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err) {
            setError('Failed to delete project.');
        } finally {
            setLoading(false);
        }
    };

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Update delete handler to use modal
    const handleDeleteRequest = (project) => {
        setProjectToDelete(project);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (projectToDelete) {
            await handleDelete(projectToDelete.id);
            setShowDeleteModal(false);
            setProjectToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setProjectToDelete(null);
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getRemainingBudget = () => {
        if (!currentProject || !currentProject.budget) return null;
        const totalUsed = projectBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
        return parseFloat(currentProject.budget) - totalUsed;
    };

    const ganttTasks = projectTasks.map(task => ({
        id: task.id.toString(),
        name: task.title,
        start: new Date(task.time_logs?.start_time || new Date()),
        end: new Date(task.time_logs?.end_time || new Date()),
        progress: 100,
        type: 'task',
        styles: { progressColor: getTaskStatusColor(task.status), progressSelectedColor: getTaskStatusColor(task.status) },
    }));

    const getProjectStatusDisplay = (project) => {
        if (project.computed_status && project.computed_status !== project.status) {
            return (
                <span className={`badge bg-${getStatusColor(project.computed_status)}`}>
                    {project.computed_status} <span title="Status automatically computed from timeline"></span>
                </span>
            );
        }
        return <span className={`badge bg-${getStatusColor(project.status)}`}>{project.status}</span>;
    };

    // Helper function for full date format
    const formatFullDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) return <div className="text-center">Loading Projects...</div>;
    if (error && !showModal) return <div className="alert alert-danger">{error}</div>;

    const sortedProjects = [...projects].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    return (
        <div>
            {sortedProjects.length === 0 && !loading && <p>No projects found. Create one!</p>}

            {sortedProjects.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
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
                            {sortedProjects.map(project => (
                                <tr key={project.id}>
                                    <td className="text-start">{project.name}</td>
                                    <td className="text-start">{project.description?.substring(0, 50)}{project.description?.length > 50 ? '...' : ''}</td>
                                    <td>{getProjectStatusDisplay(project)}</td>
                                    <td>{formatFullDate(project.start_date)}</td>
                                    <td>{formatFullDate(project.end_date)}</td>
                                    <td>{formatCurrency(project.budget)}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            
                                            size="sm"
                                            onClick={() => handleShowTasksModal(project)}
                                            className="me-2"
                                        >
                                            View Project
                                        </Button>
                                        {project.created_by === user?.id && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleShowEditModal(project)}
                                                    className="me-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteRequest(project)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={7}>
                                    <Button variant="primary" size="sm" onClick={handleShowCreateModal}>
                                        <i className="bi bi-plus"></i>
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit Project' : 'Create New Project'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit} className="w-100">
                    <Modal.Body>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <Form.Group className="mb-2">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control name="name" value={formData.name} onChange={handleInputChange} required className="w-100" />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" name="description" value={formData.description} onChange={handleInputChange} required className="w-100" />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} required className="w-100" />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>End Date</Form.Label>
                            <Form.Control type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} required className="w-100" />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                disabled={formData.status !== 'On Hold'}
                                className="w-100"
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control type="number" name="budget" value={formData.budget} onChange={handleInputChange} min="0" className="w-100" />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100 mt-2">Save</Button>
                    </Modal.Body>
                </Form>
            </Modal>

            <Modal show={showTasksModal} onHide={handleCloseTasksModal} size="xl" backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Details for {currentProject?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentProject && currentProject.budget && (
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title">Budget Summary</h5>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <strong>Total Budget:</strong> {formatCurrency(currentProject.budget)}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <strong>Budget Used:</strong>{' '}
                                            {formatCurrency(projectBudgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0))}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <strong>Remaining Budget:</strong>{' '}
                                            <span className={parseFloat(getRemainingBudget()) < 0 ? 'text-danger' : 'text-success'}>
                                                {formatCurrency(getRemainingBudget())}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {parseFloat(getRemainingBudget()) < 0 && (
                                    <div className="alert alert-warning mt-2">
                                        <i className="bi bi-exclamation-triangle"></i> Warning: This project is over budget.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        {tasksLoading && <div className="text-center">Loading tasks...</div>}
                        {tasksError && <div className="alert alert-danger">{tasksError}</div>}
                        {!tasksLoading && !tasksError && projectTasks.length === 0 && (
                            <div className="text-center">No tasks found for this project.</div>
                        )}
                        {!tasksLoading && !tasksError && projectTasks.length > 0 && (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Priority</th>
                                        <th>Assigned To</th>
                                        <th>Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectTasks.map(task => (
                                        <tr key={task.id}>
                                            <td>{task.title}</td>
                                            <td>
                                                <span className={`badge bg-${getTaskStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>{task.priority}</td>
                                            <td>{task.assigned_user?.name || 'Unassigned'}</td>
                                            <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div>
                        {tasksLoading && <div className="text-center">Loading tasks...</div>}
                        {tasksError && <div className="alert alert-danger">{tasksError}</div>}
                        {!tasksLoading && !tasksError && projectTasks.length === 0 && (
                            <div className="text-center">No tasks found for this project.</div>
                        )}
                        {!tasksLoading && !tasksError && projectTasks.length > 0 && (
                            <div style={{ height: '500px' }}>
                                <Gantt tasks={ganttTasks} viewMode={ViewMode.Day} />
                            </div>
                        )}
                    </div>
                    <div>
                        {currentProject && <TeamMembers projectId={currentProject.id} token={token} />}
                    </div>
                    <div>
                        {currentProject && (
                            <Budgets
                                projectId={currentProject.id}
                                token={token}
                                projectBudget={currentProject.budget}
                                isOwner={currentProject.created_by === user?.id}
                                onBudgetAdded={handleBudgetAdded}
                            />
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseTasksModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCancelDelete} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the project <strong>{projectToDelete?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelDelete}>Cancel</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

const getStatusColor = (status) => {
    switch (status) {
        case 'Not Started':
            return 'secondary';
        case 'In Progress':
            return 'info';
        case 'On Hold':
            return 'danger';
        case 'Completed':
            return 'success';
        default:
            return 'dark';
    }
};

const getTaskStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'pending':
            return 'secondary';
        case 'in progress':
            return 'info';
        case 'completed':
            return 'success';
        default:
            return 'dark';
    }
};

export default ProjectTable;