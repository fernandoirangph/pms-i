import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8000';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

function ProductCard({
  product,
  onShowDetails,
  onAddToCart,
  isAddingToCart,
  cartQuantity = 0,
  canAddToCart = true
}) {

  const { id, name, price, image, description, stock } = product;

  const getStockStatus = () => {
    if (stock <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (stock <= 5) {
      return <Badge bg="warning" text="dark">Low Stock: {stock}</Badge>;
    } else {
      return <Badge bg="success">In Stock: {stock}</Badge>;
    }
  };

  const handleShowDetailsClick = () => {
    onShowDetails(product);
  }

  const isInCart = cartQuantity > 0;

  const availableStock = Math.max(0, stock - cartQuantity);

  return (
    <Card className="h-100 product-card" style={{ cursor: 'pointer' }} >
      <div className="product-image-container" style={{ height: '180px', overflow: 'hidden' }}>
        <Card.Img
          variant="top"
          src={image ? `${API_BASE_URL}/storage/${product.image}` : "https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found"}
          alt={name}
          style={{ objectFit: 'contain', height: '100%', width: '100%' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';
          }}
        />
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="product-name">{name}</Card.Title>

        <Card.Text as="div" className="mb-2">
          {getStockStatus()}
          {isInCart && (
            <Badge bg="info" className="ms-2">
              {cartQuantity} in cart
            </Badge>
          )}
        </Card.Text>

        <Card.Text className="product-description" style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flexGrow: 1
        }}>
          {description || 'No description available.'}
        </Card.Text>

        <div className="d-flex justify-content-between align-items-center">
          <span className="product-price fw-bold">{formatCurrency(price)}</span>
        </div>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-between">
          <Button 
            variant="outline-primary" 
            className="view-btn"
            onClick={handleShowDetailsClick}
          >
            <i className="bi bi-eye" style={{ fontSize: '1rem' }}> </i>
            <span className="ms-1">View</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => canAddToCart ? onAddToCart(id, 1) : null}
            disabled={isAddingToCart || !canAddToCart}
            title={!canAddToCart ? 'No more stock available' : ''}
          >
            {isAddingToCart ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              <>
                {availableStock === 0 ? 'Out of Stock' : 
                <>
                  <i className="bi bi-cart" style={{ fontSize: '1rem' }}> </i>
                  Add to Cart
                </>}
              </>
            )}
          </Button>
        </Card.Footer>
    </Card>
  );
}

export default ProductCard;
