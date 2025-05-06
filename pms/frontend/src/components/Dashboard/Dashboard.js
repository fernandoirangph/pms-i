import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../App';
import ProjectCard from './../Projects/ProjectCard';
import TaskList from '../TaskList';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Initialize user as null
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const userResponse = await fetch(`${API_BASE_URL}/user`, { // Use API_BASE_URL
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const userData = await userResponse.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch(`${API_BASE_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (!projectsResponse.ok || !tasksResponse.ok) {
        throw new Error('Failed to fetch data from the server');
      }

      const projects = await projectsResponse.json();
      const tasks = await tasksResponse.json();

      setProjects(projects);
      setTasks(tasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    await fetchUserData();
    if (user) {
      await fetchDashboardData();
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const recentProjects = projects.slice(0, 3);
  const upcomingTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div className="container mt-4 dashboard">
      <h1>Welcome, {user?.first_name || "User"}</h1>

      {/* Recent Projects Section */}
      <div className="dashboard-section">
        <div className="section-header d-flex justify-content-between align-items-center">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="btn btn-link">View All</Link>
        </div>
        <div className="project-cards">
          {recentProjects.length > 0 ? (
            recentProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p>No projects available. Create your first project!</p>
          )}
        </div>
      </div>

      {/* My Tasks Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Tasks</h2>
        </div>
        {upcomingTasks.length > 0 ? (
          <TaskList tasks={upcomingTasks} showProject={true} />
        ) : (
          <p>No tasks assigned to you.</p>
        )}
      </div>

      {/* Project Statistics Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Project Statistics</h2>
        </div>
        <div className="statistics row">
          <div className="col-md-3">
            <div className="stat-card text-center p-3 border rounded">
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card text-center p-3 border rounded">
              <div className="stat-value">
                {projects.filter(project => project.status === 'in-progress').length}
              </div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card text-center p-3 border rounded">
              <div className="stat-value">
                {tasks.filter(task => task.status === 'completed').length}
              </div>
              <div className="stat-label">Completed Tasks</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card text-center p-3 border rounded">
              <div className="stat-value">
                {tasks.filter(task => task.status !== 'completed').length}
              </div>
              <div className="stat-label">Pending Tasks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;