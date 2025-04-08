import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

function NotFound() {
    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Row className="text-center">
                <Col>
                    <h1 className="display-1 fw-bold text-primary">404</h1>
                    <h2 className="mb-3">Page Not Found</h2>
                    <p className="lead text-muted mb-4">
                        Oops! The page you are looking for does not exist. It might have been moved or deleted.
                    </p>
                    <Button as={Link} to="/" variant="primary">               
                        Go Back Home
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default NotFound;
