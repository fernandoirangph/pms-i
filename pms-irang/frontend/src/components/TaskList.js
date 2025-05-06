import React from 'react';

function TaskList({ tasks, showProject = false }) {
  return (
    <ul className="list-group">
      {tasks.map(task => (
        <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <h6>{task.title}</h6>
            {showProject && <p className="mb-0 text-muted">Project: {task.project_name}</p>}
            <p className="mb-0 text-muted">Due: {new Date(task.due_date).toLocaleDateString()}</p>
          </div>
          <span className={`badge bg-${task.status === 'completed' ? 'success' : 'warning'} text-dark`}>
            {task.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;