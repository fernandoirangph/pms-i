import React from 'react';
import { Modal, Button, ListGroup, Badge, Row, Col, Image } from 'react-bootstrap';

function TransactionDetailModal({ show, handleClose, transaction }) {
    if (!transaction) return null;

    const orderTotal = transaction.orders?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0) || 0;
    const imageUrl = (productImage) => productImage ? `${API_BASE_URL}/storage/${productImage}` : 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Transaction Details - ID: {transaction.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row className="mb-3">
                    <Col><strong>Customer:</strong> {transaction.user?.name || 'N/A'} ({transaction.user?.email || 'N/A'})</Col>
                    <Col><strong>Date:</strong> {formatDateTime(transaction.checkout_timestamp)}</Col>
                </Row>
                <h6>Items Purchased:</h6>
                <ListGroup variant="flush">
                    {transaction.orders?.map(item => (
                        <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center ps-0">
                            <Row className="w-100 align-items-center">
                                <Col xs={2} sm={1}>
                                    <Image src={imageUrl(item.product?.image)} thumbnail width="50px" />
                                </Col>
                                <Col xs={6} sm={7}>
                                    <span>{item.product?.name || 'Product Not Available'}</span><br />
                                    <small className="text-muted">Qty: {item.quantity} @ {formatCurrency(item.price_per_item)}</small>
                                </Col>
                                <Col xs={4} sm={4} className="text-end fw-bold">
                                    {formatCurrency(item.total_price)}
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                    {(!transaction.orders || transaction.orders.length === 0) && (
                        <ListGroup.Item>No item details available.</ListGroup.Item>
                    )}
                </ListGroup>
                <div className="text-end mt-3 border-top pt-2">
                    <h5>Total Amount: <Badge bg="success">{formatCurrency(transaction.total_transaction_amount || orderTotal)}</Badge></h5>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TransactionDetailModal;  