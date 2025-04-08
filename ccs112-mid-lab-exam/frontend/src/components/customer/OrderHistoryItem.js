import React from 'react';
import { Accordion, ListGroup, Badge, Image, Row, Col } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8000';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

function OrderHistoryItem({ order, eventKey }) {
    const orderTotal = order.orders?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0) || 0;

    return (
        <Accordion.Item eventKey={eventKey}>
            <Accordion.Header>
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <span>Order #{order.id}</span>
                    <span className="text-muted small me-3">{formatDateTime(order.checkout_timestamp)}</span>
                    <Badge bg="success">{formatCurrency(orderTotal)}</Badge>
                </div>
            </Accordion.Header>
            <Accordion.Body>
                <h6>Order Details:</h6>
                <ListGroup variant="flush">
                    {order.orders?.map(item => (
                        <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center ps-0">
                            <Row className="w-100 align-items-center">
                                <Col xs={2} sm={1}>
                                    <Image
                                        src={item.product?.image ? `${API_BASE_URL}/storage/${item.product.image}` : 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found'}
                                        thumbnail
                                        width="50px"
                                    />
                                </Col>
                                <Col xs={6} sm={7}>
                                    <span>{item.product?.name || 'Product Not Available'}</span><br />
                                    <small className="text-muted">Qty: {item.quantity}</small>
                                </Col>
                                <Col xs={4} sm={4} className="text-end">
                                    {formatCurrency(item.total_price)}
                                    <br />
                                    <small className="text-muted">({formatCurrency(item.price_per_item)} each)</small>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                    {(!order.orders || order.orders.length === 0) && (
                        <ListGroup.Item>No items found for this order.</ListGroup.Item>
                    )}
                </ListGroup>
                <div className="text-end mt-2 fw-bold">
                    Order Total: {formatCurrency(orderTotal)}
                </div>
            </Accordion.Body>
        </Accordion.Item>
    );
}

export default OrderHistoryItem;