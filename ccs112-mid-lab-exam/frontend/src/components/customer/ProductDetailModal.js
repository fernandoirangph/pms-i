import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Image, InputGroup, Badge, Alert } from 'react-bootstrap';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

function ProductDetailModal({
  show,
  handleClose,
  product,
  onAddToCart,
  isAddingToCart,
  cartQuantity = 0,
  availableStock = 0,
  canAddToCart = true
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (show && product) {

      setQuantity(Math.min(1, availableStock));
    }
  }, [show, product, availableStock]);

  if (!product) {
    return null;
  }

  const { id, name, description, price, image, stock } = product;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= availableStock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < availableStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(id, quantity);
  };

  const getStockStatusText = () => {
    if (stock <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (cartQuantity > 0 && availableStock <= 0) {
      return <Badge bg="danger">Maximum quantity in cart</Badge>;
    } else if (stock <= 5) {
      return <Badge bg="warning" text="dark">Low Stock: {stock}</Badge>;
    } else {
      return <Badge bg="success">In Stock: {stock}</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{name}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row>
          <Col xs={12} md={6} className="mb-3">
            <Image
              src={image || 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found'}
              alt={name}
              fluid
              className="product-detail-image"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';
              }}
            />
          </Col>

          <Col xs={12} md={6}>
            <h4>{name}</h4>

            <p className="text-muted mb-3">{description}</p>

            <h5 className="mb-3">{formatCurrency(price)}</h5>

            <div className="mb-3">
              {getStockStatusText()}
              {cartQuantity > 0 && (
                <Badge bg="info" className="ms-2">
                  {cartQuantity} already in cart
                </Badge>
              )}
            </div>

            {availableStock > 0 && availableStock <= 5 && (
              <Alert variant="warning" className="py-2">
                Only {availableStock} units available to add
              </Alert>
            )}

            {canAddToCart && availableStock > 0 ? (
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <InputGroup>
                  <Button
                    variant="outline-secondary"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>

                  <Form.Control
                    type="number"
                    min="1"
                    max={availableStock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    style={{ textAlign: 'center' }}
                  />

                  <Button
                    variant="outline-secondary"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableStock}
                  >
                    +
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Maximum: {availableStock}
                </Form.Text>
              </Form.Group>
            ) : null}

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !canAddToCart || availableStock <= 0}
              >
                {isAddingToCart ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding to Cart...
                  </>
                ) : availableStock <= 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <i className="bi bi-cart" style={{ fontSize: '1rem' }}> </i>
                      Add to Cart - ${formatCurrency(price * quantity)}
                  </>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailModal;