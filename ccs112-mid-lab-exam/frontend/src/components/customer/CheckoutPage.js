import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Card, ListGroup, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

function CheckoutPage() {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');

    const { authToken } = useAuth();
    const navigate = useNavigate();

    const showToastMessage = (message, variant = 'success') => {
        setToastMessage(message);
        setToastVariant(variant);
        setShowToast(true);
    };

    const fetchCart = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setCheckoutError('');

        if (!authToken) {
            setError('Please login to proceed to checkout.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error('Failed to fetch cart details for checkout.');
            }
            const data = await response.json();

            const fetchedCart = data.cart || null;
            if (!fetchedCart || !fetchedCart.orders || fetchedCart.orders.length === 0) {
                throw new Error('Your cart is empty. Cannot proceed to checkout.');
            }
            setCart(fetchedCart);

        } catch (err) {
            console.error("Fetch cart for checkout error:", err);
            setError(err.message || 'Could not load cart details.');
            setCart(null);
            if (err.message.includes('Authentication')) navigate('/login');
            if (err.message.includes('empty')) navigate('/store/cart');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, navigate]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handlePlaceOrder = async () => {
        if (!cart || cart.orders.length === 0) {
            showToastMessage('Cannot place order with an empty cart.', 'danger');
            return;
        }

        setIsPlacingOrder(true);
        setCheckoutError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/checkout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Checkout failed. Please try again.');
            }

            showToastMessage('Order placed successfully!');
            setCart(null);

            navigate('/store/orders');

        } catch (err) {
            console.error("Place order error:", err);
            setCheckoutError(err.message || 'An unexpected error occurred during checkout.');
            showToastMessage(err.message || 'An unexpected error occurred during checkout.', 'danger');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const cartTotal = useMemo(() => {
        if (!cart || !cart.orders || cart.orders.length === 0) {
            return 0;
        }
        return cart.orders.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
    }, [cart]);

    if (isLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading Checkout...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger" className="my-4">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate('/store/cart')}>Back to Cart</Button>
            </Container>
        );
    }

    if (!cart) {
        return (
            <Container className="text-center my-5">
                <h2>Cannot load cart details.</h2>
                <Button variant="secondary" onClick={() => navigate('/store/cart')}>Back to Cart</Button>
            </Container>
        );
    }
    return (
        <Container>
            <h2 className="my-4">Checkout</h2>

            <ToastContainer className="position-fixed p-3" position="top-end">
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={3000}
                    autohide
                    bg={toastVariant}
                    text={toastVariant === 'dark' ? 'white' : 'dark'}
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">Notification</strong>
                    </Toast.Header>
                    <Toast.Body>{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Row>
                <Col md={7} lg={8} className="mb-4">
                    <Card>
                        <Card.Header as="h5">Order Summary</Card.Header>
                        <ListGroup variant="flush">
                            {cart.orders.map(item => (
                                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className='fw-bold'>{item.product?.name || 'N/A'}</span> <br />
                                        <small className="text-muted">
                                            Qty: {item.quantity} x {formatCurrency(item.price_per_item)}
                                        </small>
                                    </div>
                                    <span>{formatCurrency(item.total_price)}</span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                </Col>

                <Col md={5} lg={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-3">Total</Card.Title>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="h5">Order Total:</span>
                                <span className="h5 fw-bold">{formatCurrency(cartTotal)}</span>
                            </div>

                            {checkoutError && (
                                <Alert variant="danger" className="mt-3">
                                    {checkoutError}
                                </Alert>
                            )}

                            <div className="d-grid">
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder || cartTotal <= 0}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                            {' '}Placing Order...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </Button>
                            </div>
                            <Button variant="link" className="mt-2 p-0" onClick={() => navigate('/store/cart')}>
                                Back to Cart
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CheckoutPage;