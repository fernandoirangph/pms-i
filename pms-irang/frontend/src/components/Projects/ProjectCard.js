import React from 'react';
import { Link } from 'react-router-dom';

function ProjectCard({ project }) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{project.name}</h5>
        <p className="card-text">{project.description || 'No description available.'}</p>
        <p className="card-text">
          <small className="text-muted">Status: {project.status}</small>
        </p>
        <Link to={`/projects/${project.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProjectCard;