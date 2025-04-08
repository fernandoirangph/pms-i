import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:8000';

function Header() {
    const { user, authToken, logout } = useAuth();

    const { itemCount = 0 } = {};

    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    const isCustomer = authToken && user?.role === 'customer';

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setLogoutError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (response.ok || response.status === 401) {
                logout();
                navigate('/login');
            } else {
                const errorData = await response.json();
                setLogoutError(errorData.message || 'Logout failed.');
            }
        } catch (err) {
            setLogoutError('Network error during logout.');

        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/store/catalog" className="fw-bold">
                   Ecommerce Store
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/store/catalog" end>
                            Products
                        </Nav.Link>
                        {isCustomer && (
                            <Nav.Link as={NavLink} to="/store/orders">
                                My Orders
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/store/cart" className="position-relative me-3">
                            <i className="bi bi-cart" style={{ fontSize: '1.5rem' }}></i>                              
                            {itemCount > 0 && (
                                <Badge
                                    pill
                                    bg="primary"
                                    className="position-absolute top-0 start-100 translate-middle"
                                    style={{ fontSize: '0.7em' }}
                                >
                                    {itemCount}
                                    <span className="visually-hidden">items in cart</span>
                                </Badge>
                            )}
                        </Nav.Link>

                        {!authToken ? (
                            <>
                                <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                                <Button as={Link} to="/register" variant="outline-primary" size="sm">Register</Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </Button>
                                {logoutError && <span className="text-danger ms-2 small">{logoutError}</span>}
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;