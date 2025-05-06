import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';

const LoadingModal = ({ show, message }) => {
  return (
    <Modal show={show} centered>
      <Modal.Body className="text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">{message || 'Loading...'}</p>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;