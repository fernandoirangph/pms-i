import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Table, Button, Modal, Form, Spinner, Alert, Image } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8000';
const DUMMY_IMAGE_URL = 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

function ProductManagement() {
    const { authToken } = useAuth();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch products.');
            }
            const data = await response.json();
            setProducts(data || []);
        } catch (err) {
            console.error("Fetch products error:", err);
            setError(err.message || 'Could not fetch products.');
        } finally {
            setIsLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (authToken) {
            fetchProducts();
        }
    }, [authToken, fetchProducts]);

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setSelectedFile(null);
        setImagePreview(null);
        setModalError('');
        setIsSubmitting(false);
    };

    const handleShowAddModal = () => {
        setCurrentProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setImagePreview(null);
        setSelectedFile(null);
        setModalError('');
        setShowModal(true);
    };

    const handleShowEditModal = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
        });

        setImagePreview(product.image ? `${API_BASE_URL}/storage/${product.image}` : DUMMY_IMAGE_URL);
        setSelectedFile(null);
        setModalError('');
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setImagePreview(currentProduct?.image ? `${API_BASE_URL}/storage/${currentProduct.image}` : DUMMY_IMAGE_URL);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setModalError('');

        const productData = new FormData();
        productData.append('name', formData.name);
        productData.append('description', formData.description);
        productData.append('price', formData.price);
        productData.append('stock', formData.stock);
        if (selectedFile) {
            productData.append('image', selectedFile);
        }

        let url = `${API_BASE_URL}/api/products`;
        let method = 'POST';

        if (currentProduct) {
            url = `${API_BASE_URL}/api/products/${currentProduct.id}`;
            method = 'POST';
            productData.append('_method', 'PUT');
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: productData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && responseData.errors) {
                    const errors = Object.values(responseData.errors).flat().join(' ');
                    throw new Error(errors || 'Validation failed.');
                }
                throw new Error(responseData.message || `Failed to ${currentProduct ? 'update' : 'add'} product.`);
            }

            handleCloseModal();
            fetchProducts();
        } catch (err) {
            console.error("Submit product error:", err);
            setModalError(err.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showDeleteConfirmation = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
        setIsDeleting(false);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        
        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${productToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 403 || response.status === 400) {
                    throw new Error(responseData.message || 'Cannot delete product. It might be part of an existing order.');
                }
                throw new Error(responseData.message || 'Failed to delete product.');
            }

            closeDeleteModal();
            fetchProducts();
        } catch (err) {
            console.error("Delete product error:", err);
            setError(err.message || 'Could not delete product.');
            closeDeleteModal();
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Product Management</h2>
                <Button variant="primary" onClick={handleShowAddModal}>
                    Add New Product
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {isLoading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading Products...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <Image
                                            src={product.image ? `${API_BASE_URL}/storage/${product.image}` : DUMMY_IMAGE_URL}
                                            alt={product.name}
                                            thumbnail
                                            style={{ width: '75px', height: 'auto' }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DUMMY_IMAGE_URL;
                                            }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowEditModal(product)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => showDeleteConfirmation(product)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">No products found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {modalError && <Alert variant="danger">{modalError}</Alert>}
                        <Form.Group className="mb-3" controlId="productName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0.01"
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productStock">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="1"
                                disabled={isSubmitting}
                            />
                        </Form.Group>

                        <Form.Group controlId="productImage" className="mb-3">
                            <Form.Label>Product Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <Image 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        thumbnail 
                                        style={{ maxHeight: '150px' }} 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DUMMY_IMAGE_URL;
                                        }}
                                    />
                                </div>
                            )}
                            <Form.Text muted>
                                {currentProduct ? 'Leave blank to keep the current image.' : 'Upload a JPG or PNG image.'}
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    {' '}Saving...
                                </>
                            ) : (
                                currentProduct ? 'Update Product' : 'Add Product'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showDeleteModal} onHide={closeDeleteModal} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {productToDelete && (
                        <div>
                            <p>Are you sure you want to delete this product?</p>
                            <div className="d-flex align-items-center mb-2">
                                <Image
                                    src={productToDelete.image ? `${API_BASE_URL}/storage/${productToDelete.image}` : DUMMY_IMAGE_URL}
                                    alt={productToDelete.name}
                                    thumbnail
                                    style={{ width: '50px', height: 'auto', marginRight: '10px' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DUMMY_IMAGE_URL;
                                    }}
                                />
                                <div>
                                    <strong>ID:</strong> {productToDelete.id}<br />
                                    <strong>Name:</strong> {productToDelete.name}
                                </div>
                            </div>
                            <Alert variant="warning">
                                This action cannot be undone. Products that are part of existing orders cannot be deleted.
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                {' '}Deleting...
                            </>
                        ) : (
                            'Delete Product'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ProductManagement;