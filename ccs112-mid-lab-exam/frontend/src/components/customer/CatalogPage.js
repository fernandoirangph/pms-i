import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

const API_BASE_URL = 'http://localhost:8000';

function CatalogPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [addingToCart, setAddingToCart] = useState(new Set());

    const [cartItems, setCartItems] = useState([]);

    const [toasts, setToasts] = useState([]);

    const { authToken, user } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, variant = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, variant }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchProducts = useCallback(async (query = '') => {
        setIsLoading(true);
        setError('');

        const url = `${API_BASE_URL}/api/products?search=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch products.');
            }
            const data = await response.json();

            setProducts(data.data || data || []);
        } catch (err) {
            console.error("Fetch products error:", err);
            setError(err.message || 'Could not load products.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [authToken]);

    const fetchCartData = useCallback(async () => {
        if (!authToken || user?.role !== 'customer') {
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
                throw new Error('Failed to fetch cart data.');
            }

            const data = await response.json();

            setCartItems(data.cart?.orders || []);
        } catch (err) {
            console.error("Fetch cart error:", err);
        }
    }, [authToken, user]);

    useEffect(() => {
        fetchProducts(searchTerm);
    }, [searchTerm, fetchProducts]);

    useEffect(() => {
        fetchCartData();
    }, [fetchCartData]);

    const getCartQuantity = useCallback((productId) => {
        const cartItem = cartItems.find(item => item.product_id === productId);
        return cartItem ? cartItem.quantity : 0;
    }, [cartItems]);

    const canAddToCart = useCallback((product) => {
        if (!product) return false;
        const cartQuantity = getCartQuantity(product.id);
        return product.stock > cartQuantity;
    }, [getCartQuantity]);

    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleAddToCart = useCallback(async (productId, quantity) => {
        if (!authToken || user?.role !== 'customer') {
            showToast('Please login to add items to your cart.', 'info');
            navigate('/login');
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            showToast('Product not found.', 'danger');
            return;
        }

        const currentCartQuantity = getCartQuantity(productId);
        if (product.stock <= currentCartQuantity) {
            showToast('This product is out of stock or has reached maximum available quantity.', 'warning');
            return;
        }

        if (quantity > (product.stock - currentCartQuantity)) {
            showToast(`Only ${product.stock - currentCartQuantity} units available for this product.`, 'warning');
            return;
        }

        setAddingToCart(prev => new Set(prev).add(productId));

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add item to cart.');
            }

            showToast(data.message || 'Item added to cart!', 'success');

            fetchCartData();
        } catch (err) {
            console.error("Add to cart error:", err);
            showToast(err.message || 'Could not add item to cart.', 'danger');
            setError(err.message);
        } finally {
            setAddingToCart(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    }, [authToken, user, navigate, products, getCartQuantity, fetchCartData]);

    return (
        <Container fluid="lg"> <h1 className="my-4 text-center">Our Products</h1>
            <Form.Group as={Row} className="mb-4">
                <Col sm={12}>
                    <Form.Control
                        type="search"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
            </Form.Group>

            {isLoading && (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading products...</span>
                    </Spinner>
                </div>
            )}

            {error && !isLoading && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">                      
                    {products.length > 0 ? (
                        products.map(product => (
                        <Col key={product.id}>
                            <ProductCard
                                product={product}
                                onShowDetails={handleShowModal}
                                onAddToCart={handleAddToCart}
                                isAddingToCart={addingToCart.has(product.id)}
                                cartQuantity={getCartQuantity(product.id)}
                                canAddToCart={canAddToCart(product)}
                            />
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p>No products found matching your criteria.</p>
                    </Col>
                )}
                </Row>
            )}

            <ProductDetailModal
                show={showModal}
                handleClose={handleCloseModal}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                isAddingToCart={selectedProduct ? addingToCart.has(selectedProduct.id) : false}
                cartQuantity={selectedProduct ? getCartQuantity(selectedProduct.id) : 0}
                availableStock={selectedProduct ? Math.max(0, selectedProduct.stock - getCartQuantity(selectedProduct.id)) : 0}
                canAddToCart={selectedProduct ? canAddToCart(selectedProduct) : false}
            />

            <ToastContainer
                className="p-3"
                position="top-end"
                style={{ zIndex: 1070 }}
            >
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        bg={toast.variant}
                        onClose={() => removeToast(toast.id)}
                        show={true}
                        delay={3000}
                        autohide
                    >
                        <Toast.Header closeButton>
                            <strong className="me-auto">Notification</strong>
                        </Toast.Header>
                        <Toast.Body className={toast.variant === 'dark' || toast.variant === 'danger' ? 'text-white' : ''}>
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </Container>
    );
}

export default CatalogPage;