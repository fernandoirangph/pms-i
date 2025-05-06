import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';

const LoadingModal = ({ show, message }) => {
  return (
    <Modal show={show} centered>
      <Modal.Body className="text-center" style={{ width: '300px', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Spinner animation="border" role="status" />
        <p>{message || 'Loading...'}</p>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;