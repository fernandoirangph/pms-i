import React, { useState, useEffect } from 'react';
import { Button, Form, Image } from 'react-bootstrap';

const API_BASE_URL = 'http://localhost:8000';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function CartItem({ item, onUpdateQuantity, onRemoveItem, isUpdating, isRemoving }) {

    const [currentQuantity, setCurrentQuantity] = useState(item.quantity);

    useEffect(() => {
        setCurrentQuantity(item.quantity);
    }, [item.quantity]);

    const imageUrl = item.product?.image
        ? `${API_BASE_URL}/storage/${item.product.image}`
        : 'https://dummyimage.com/300x300/cccccc/000000&text=Image+Not+Found';

    const handleQuantityChange = (e) => {
        const value = e.target.value;

        const numericValue = parseInt(value, 10);

        if (value === '' || (numericValue > 0 && numericValue <= item.product.stock)) {
            setCurrentQuantity(value);

            debouncedUpdateQuantity(item.id, numericValue || 1);
        } else if (numericValue > item.product.stock) {
            setCurrentQuantity(item.product.stock);
            debouncedUpdateQuantity(item.id, item.product.stock);
        } else if (numericValue <= 0 && value !== '') {
            setCurrentQuantity(1);
            debouncedUpdateQuantity(item.id, 1);
        }
    };

    // Fix: Convert to inline function with proper dependencies
    const debouncedUpdateQuantity = React.useCallback(
        // Using inline function instead of direct reference to debounce
        (orderId, quantity) => {
            const debouncedFn = debounce((id, qty) => {
                onUpdateQuantity(id, qty);
            }, 750);
            debouncedFn(orderId, quantity);
        },
        [onUpdateQuantity]
    );

    const handleRemoveClick = () => {
        onRemoveItem(item.id);
    };

    const isLoading = isUpdating || isRemoving;
    return (
        <tr>
            <td style={{ width: '40%' }}>
                <div className="d-flex align-items-center">
                    <Image
                        src={imageUrl}
                        alt={item.product?.name || 'Product'}
                        thumbnail
                        style={{ width: '75px', height: 'auto', marginRight: '15px' }}
                    />
                    <span>{item.product?.name || 'Product Unavailable'}</span>
                </div>
            </td>

            <td className="text-end align-middle">
                {formatCurrency(item.price_per_item)}
            </td>

            <td className="text-center align-middle" style={{ width: '15%' }}>
                <Form.Control
                    type="number"
                    size="sm"
                    value={currentQuantity}
                    onChange={handleQuantityChange}
                    onBlur={(e) => {
                        if (e.target.value === '') {
                            setCurrentQuantity(1);
                            debouncedUpdateQuantity(item.id, 1);
                        }
                    }}
                    min="1"
                    max={item.product?.stock || 1}
                    disabled={isLoading || !item.product}
                    style={{ maxWidth: '80px', margin: 'auto' }}
                    isInvalid={currentQuantity > (item.product?.stock || 0)}
                />
                {currentQuantity > (item.product?.stock || 0) && (
                    <Form.Text className="text-danger small">
                        Max: {item.product?.stock || 0}
                    </Form.Text>
                )}
            </td>

            <td className="text-end align-middle">
                {formatCurrency(item.total_price)}
            </td>

            <td className="text-center align-middle">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveClick}
                    disabled={isLoading}
                    title="Remove Item"
                >
                    <i className="bi bi-trash"></i>
                </Button>
            </td>
        </tr>
    );
}

export default CartItem;
