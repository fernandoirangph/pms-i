import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../App';
import { Navbar, Nav, NavDropdown, Button, Badge } from 'react-bootstrap';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

const ProjectDetails = ({
  currentProject,
  projectBudgets,
  getRemainingBudget,
  formatCurrency,
  tasksLoading,
  tasksError,
  projectTasks,
  getTaskStatusColor,
  ganttTasks,
  ViewMode,
  TeamMembers,
  Budgets,
  token,
  user,
  handleBudgetAdded,
}) => (
  <div>
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
  </div>
);

export default ProjectDetails;
