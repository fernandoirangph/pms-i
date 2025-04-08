
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Table, Button, Modal, ListGroup, Badge, Image, Form, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

function TransactionMonitoring() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [paginationData, setPaginationData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [detailError, setDetailError] = useState('');

    const { authToken } = useAuth();
    const navigate = useNavigate();

    const fetchTransactions = useCallback(async (page = 1, date = '') => {
        setIsLoading(true);
        setError('');

        if (!authToken) {
            setError('Authentication required.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        let url = `${API_BASE_URL}/api/admin/transactions?page=${page}`;
        if (date) {
            url += `&date=${date}`;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized or Forbidden. Please login as Admin.');
                }
                throw new Error('Failed to fetch transactions.');
            }
            const data = await response.json();

            setTransactions(data.data || []);
            setPaginationData({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to,
            });
            setCurrentPage(data.current_page);

        } catch (err) {
            console.error("Fetch transactions error:", err);
            setError(err.message || 'Could not load transactions.');
            setTransactions([]);
            setPaginationData(null);
            if (err.message.includes('Unauthorized')) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, navigate]);

    const fetchTransactionDetail = useCallback(async (transactionId) => {
        setIsLoadingDetail(true);
        setDetailError('');
        setSelectedTransaction(null);

        if (!authToken) {
            setDetailError('Authentication required.');
            setIsLoadingDetail(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/transactions/${transactionId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Transaction not found.');
                }
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Unauthorized or Forbidden.');
                }
                throw new Error('Failed to fetch transaction details.');
            }
            const data = await response.json();
            setSelectedTransaction(data);
            setShowDetailModal(true);

        } catch (err) {
            console.error("Fetch transaction detail error:", err);
            setDetailError(err.message || 'Could not load transaction details.');
            setShowDetailModal(true);
        } finally {
            setIsLoadingDetail(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchTransactions(currentPage, selectedDate);
    }, [fetchTransactions, currentPage, selectedDate]);


    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setCurrentPage(1);
    };

    const handleClearDate = () => {
        setSelectedDate('');
        setCurrentPage(1);
    };

    const handleShowDetail = (transactionId) => {
        fetchTransactionDetail(transactionId);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransaction(null);
        setDetailError('');
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPagination = () => {
        if (!paginationData || paginationData.last_page <= 1) {
            return null;
        }
        let items = [];

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(paginationData.last_page, currentPage + 2);

        if (currentPage > 1) items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />);
        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>
            );
        }
        if (endPage < paginationData.last_page) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        if (currentPage < paginationData.last_page) items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />);

        return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
    };

    const renderDetailModalContent = () => {
        if (isLoadingDetail) {
            return <div className="text-center"><Spinner animation="border" /></div>;
        }
        if (detailError) {
            return <Alert variant="danger">{detailError}</Alert>;
        }
        if (!selectedTransaction) {
            return <Alert variant="warning">No transaction data loaded.</Alert>;
        }

        const transaction = selectedTransaction;
        const orderTotal = transaction.orders?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0) || 0;
        const imageUrl = (productImage) => productImage ? `${API_BASE_URL}/storage/${productImage}` : 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';

        return (
            <>
                <Row className="mb-3">
                    <Col md={6}><strong>Customer:</strong> {transaction.user?.name || 'N/A'} ({transaction.user?.email || 'N/A'})</Col>
                    <Col md={6}><strong>Date:</strong> {formatDateTime(transaction.checkout_timestamp)}</Col>
                </Row>
                <h6>Items Purchased:</h6>
                <ListGroup variant="flush" className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                <div className="text-end mt-2 border-top pt-2">
                    <h5>Total Amount: <Badge bg="success">{formatCurrency(transaction.total_transaction_amount || orderTotal)}</Badge></h5>
                </div>
            </>
        );
    };

    return (
        <Container fluid>              
            <h2 className="my-4">Transaction Monitoring</h2>
            <Row className="mb-3 align-items-end">
                <Col md={4}>
                    <Form.Group controlId="filterDate">
                        <Form.Label>Filter by Date:</Form.Label>
                        <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </Form.Group>
                </Col>
                <Col md={2}>
                    {selectedDate && (
                        <Button variant="outline-secondary" onClick={handleClearDate} className="w-100">
                            Clear Filter
                        </Button>
                    )}
                </Col>
            </Row>

            {isLoading && <div className="text-center my-3"><Spinner animation="border" /> Loading transactions...</div>}
            {error && !isLoading && <Alert variant="danger">{error}</Alert>}

            {!isLoading && !error && (
                <>
                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Date</th>
                                <th className="text-end">Total Amount</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{tx.id}</td>
                                        <td>{tx.user?.name || 'N/A'}</td>
                                        <td>{tx.user?.email || 'N/A'}</td>
                                        <td>{formatDateTime(tx.checkout_timestamp)}</td>
                                        <td className="text-end">
                                            {formatCurrency(tx.total_transaction_amount || tx.orders?.reduce((sum, i) => sum + parseFloat(i.total_price || 0), 0) || 0)}
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() => handleShowDetail(tx.id)}
                                                disabled={isLoadingDetail && selectedTransaction?.id === tx.id}
                                            >
                                                {isLoadingDetail && selectedTransaction?.id === tx.id ? <Spinner size="sm" animation="border" /> : 'Details'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No transactions found matching criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}

            <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Transaction Details {selectedTransaction ? `- ID: ${selectedTransaction.id}` : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderDetailModalContent()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default TransactionMonitoring;