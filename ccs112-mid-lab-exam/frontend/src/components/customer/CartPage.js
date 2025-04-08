import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Spinner, Alert, Table, Button, Card, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CartItem from './CartItem';
import { Modal } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8000';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

function CartPage() {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingItems, setUpdatingItems] = useState(new Set());
    const [removingItems, setRemovingItems] = useState(new Set());

    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { authToken } = useAuth();
    const navigate = useNavigate();

    const handleRemoveClick = useCallback((orderId) => {
        setSelectedOrderId(orderId);
        setShowDeleteModal(true);
    }, []);

    const showToast = useCallback((message, variant = 'success') => {
        setToast({ show: true, message, variant });
    }, []);

    // Remove the cart and isLoading dependencies to break the infinite loop
    const fetchCart = useCallback(async () => {
        // Instead of checking isLoading and cart here, we'll control when this runs via the useEffect
        setIsLoading(true);
        setError('');

        if (!authToken) {
            setError('Please login to view your cart.');
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
                throw new Error('Failed to fetch cart.');
            }
            const data = await response.json();

            setCart(data.cart || null);

        } catch (err) {
            console.error("Fetch cart error:", err);
            setError(err.message || 'Could not load cart.');
            setCart(null);
            if (err.message.includes('Authentication')) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, navigate]); // Removed isLoading and cart dependencies

    // Only run fetchCart when authToken changes
    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken]); // Intentionally leaving out fetchCart to avoid the loop

    const handleUpdateQuantity = useCallback(async (orderId, quantity) => {
        setUpdatingItems(prev => new Set(prev).add(orderId));
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/update/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ quantity }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update quantity.');
            }
            setCart(data.cart);
            showToast('Cart updated.');

        } catch (err) {
            console.error("Update quantity error:", err);
            showToast(err.message || 'Could not update item quantity.', 'danger');

        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    }, [authToken, showToast]);

    const confirmRemoveItem = useCallback(async () => {
        if (!selectedOrderId) return;
        setRemovingItems(prev => new Set(prev).add(selectedOrderId));

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/remove/${selectedOrderId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove item.');
            }
            setCart(data.cart);
            showToast('Item removed from cart.');
        } catch (err) {
            console.error("Remove item error:", err);
            showToast(err.message || 'Could not remove item.', 'danger');
        } finally {
            setRemovingItems(prev => {
                const next = new Set(prev);
                next.delete(selectedOrderId);
                return next;
            });
            setShowDeleteModal(false);
            setSelectedOrderId(null);
        }
    }, [authToken, selectedOrderId, showToast]);

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
                    <span className="visually-hidden">Loading Cart...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger" className="my-4">{error}</Alert>
            </Container>
        );
    }

    if (!cart || !cart.orders || cart.orders.length === 0) {
        return (
            <Container className="text-center my-5">
                <h2>Your Shopping Cart is Empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <Button as={Link} to="/store/catalog" variant="primary">
                    Start Shopping
                </Button>
            </Container>
        );
    }

    return (
        <Container>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Removal</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to remove this item from your cart?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmRemoveItem}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1021 }}>
                <Toast
                    bg={toast.variant}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                    show={toast.show}
                    delay={3000}
                    autohide
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">Cart Notification</strong>
                    </Toast.Header>
                    <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
                        {toast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <h2 className="my-4">Shopping Cart</h2>
            <Row>
                <Col lg={8} className="mb-4 mb-lg-0">
                    <Table responsive hover className="align-middle">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th className="text-end">Price</th>
                                <th className="text-center">Quantity</th>
                                <th className="text-end">Subtotal</th>
                                <th className="text-center">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.orders.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={() => handleRemoveClick(item.id)}
                                    isUpdating={updatingItems.has(item.id)}
                                    isRemoving={removingItems.has(item.id)}
                                />
                            ))}
                        </tbody>
                    </Table>
                </Col>

                <Col lg={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-3">Cart Summary</Card.Title>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Subtotal:</span>
                                <span className="fw-bold">{formatCurrency(cartTotal)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-3">
                                <span className="h5">Total:</span>
                                <span className="h5 fw-bold">{formatCurrency(cartTotal)}</span>
                            </div>
                            <div className="d-grid">
                                <Button
                                    as={Link}
                                    to="/store/checkout"
                                    variant="primary"
                                    size="lg"
                                    disabled={cartTotal <= 0}
                                >
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CartPage;