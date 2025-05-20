import React, { useState, useEffect, useCallback } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../App';
import { Navbar, Nav, NavDropdown, Button, Badge } from 'react-bootstrap';

const Navbar = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
    <div className="container-fluid">
        <Navbar.Brand as={Link} to="/dashboard">
            Klick Inc. PMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="dashboardNavbar" />
        <Navbar.Collapse id="dashboardNavbar">
            <Nav className="me-auto">
                <Nav.Link as={Link} to="projects">
                    Projects
                </Nav.Link>
                <Nav.Link as={Link} to="tasks">
                    Tasks
                </Nav.Link>
            </Nav>
            <Nav>
                <NavDropdown
                    title={
                        <span>
                            Notifications{' '}
                            {totalNotifications > 0 && (
                                <Badge bg="danger">{totalNotifications}</Badge>
                            )}
                        </span>
                    }
                    id="notifications-dropdown"
                >
                    {loading && (
                        <NavDropdown.Item disabled>Loading...</NavDropdown.Item>
                    )}
                    {error && (
                        <NavDropdown.Item className="text-danger">
                            {error}
                        </NavDropdown.Item>
                    )}
                    {!loading && !error && totalNotifications === 0 && (
                        <NavDropdown.Item>No pending notifications</NavDropdown.Item>
                    )}
                    {!loading && !error && notifications.invitations.length > 0 && (
                        <>
                            <NavDropdown.Header>Project Invitations</NavDropdown.Header>
                            {notifications.invitations.map(invitation => (
                                <NavDropdown.Item
                                    key={`invitation-${invitation.id}`}
                                    className="d-flex align-items-center"
                                >
                                    <div className="flex-grow-1">
                                        <strong>{invitation.project.name}</strong>
                                        <br />
                                        <small>
                                            Invited by:{' '}
                                            {invitation.invited_by_user?.name || 'Unknown'}
                                        </small>
                                    </div>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() =>
                                            handleAcceptInvitation(
                                                invitation.project_id,
                                                invitation.id
                                            )
                                        }
                                    >
                                        Accept
                                    </Button>
                                </NavDropdown.Item>
                            ))}
                        </>
                    )}
                    {!loading && !error && notifications.taskAssignments.length > 0 && (
                        <>
                            <NavDropdown.Header>Task Assignments</NavDropdown.Header>
                            {notifications.taskAssignments.map(task => (
                                <NavDropdown.Item
                                    key={`task-${task.id}`}
                                    className="d-flex align-items-center"
                                >
                                    <div className="flex-grow-1">
                                        <strong>{task.title}</strong>
                                        <br />
                                        <small>
                                            Project: {task.project?.name || 'Unknown'}<br />
                                            Assigned by: {task.owner?.name || 'Unknown'}
                                        </small>
                                    </div>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => handleAcknowledgeTask(task.id)}
                                    >
                                        Acknowledge
                                    </Button>
                                </NavDropdown.Item>
                            ))}
                        </>
                    )}
                </NavDropdown>
                <Button
                    variant="outline-light"
                    className="ms-2"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Nav>
        </Navbar.Collapse>
    </div>
</Navbar>
);

export default Navbar;
