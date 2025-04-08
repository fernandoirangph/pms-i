import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Accordion, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrderHistoryItem from './OrderHistoryItem';

const API_BASE_URL = 'http://localhost:8000';

function OrderHistoryPage() {
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [paginationData, setPaginationData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const { authToken } = useAuth();
    const navigate = useNavigate();

    const fetchOrderHistory = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError('');

        if (!authToken) {
            setError('Please login to view your order history.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/history?page=${page}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error('Failed to fetch order history.');
            }
            const data = await response.json();

            setOrderHistory(data.data || []);
            setPaginationData({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to,
            });
            setCurrentPage(data.current_page);

        } catch (err) {
            console.error("Fetch order history error:", err);
            setError(err.message || 'Could not load order history.');
            setOrderHistory([]);
            setPaginationData(null);
            if (err.message.includes('Authentication')) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [authToken, navigate]);

    useEffect(() => {
        fetchOrderHistory(currentPage);
    }, [fetchOrderHistory, currentPage]);

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
        for (let number = 1; number <= paginationData.last_page; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }
        return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
    };

    if (isLoading && orderHistory.length === 0) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading Order History...</span>
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

    if (!isLoading && orderHistory.length === 0) {
        return (
            <Container className="text-center my-5">
                <h2>No Order History Found</h2>
                <p>You haven't placed any orders yet.</p>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="my-4">My Order History</h2>
            {isLoading && <div className="text-center mb-3"><Spinner animation="border" size="sm" /> Loading...</div>}
            <Accordion>
                {orderHistory.map((order, index) => (
                    <OrderHistoryItem
                        key={order.id}
                        order={order}
                        eventKey={index.toString()}
                    />
                ))}
            </Accordion>
            {renderPagination()}
        </Container>
    );
}

export default OrderHistoryPage;