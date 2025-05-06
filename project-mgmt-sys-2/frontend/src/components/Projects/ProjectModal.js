import React, { useEffect, useState } from 'react';

const ProjectModal = ({ show, onClose, onSubmit, formData, editingProjectId, setFormData }) => {
  const [calculatedStatus, setCalculatedStatus] = useState('not_started');

  // Function to calculate the status based on the start_date and end_date
  const calculateStatus = () => {
    const now = new Date();
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    if (startDate && endDate) {
      if (now < startDate) {
        return 'not_started';
      } else if (now > endDate) {
        return 'completed';
      } else {
        return 'in_progress';
      }
    } else if (startDate && !endDate) {
      if (now < startDate) {
        return 'not_started';
      } else {
        return 'in_progress';
      }
    } else if (!startDate && endDate) {
      if (now > endDate) {
        return 'completed';
      } else {
        return 'in_progress';
      }
    }

    return 'not_started';
  };

  // Update the calculated status whenever start_date or end_date changes
  useEffect(() => {
    const status = calculateStatus();
    setCalculatedStatus(status);
  }, [formData.start_date, formData.end_date]);

  // Strip the time portion from start_date and end_date if they include a 'T' character
  useEffect(() => {
    if (formData.start_date && formData.start_date.includes('T')) {
      setFormData((prevData) => ({
        ...prevData,
        start_date: prevData.start_date.split('T')[0],
      }));
    }
    if (formData.end_date && formData.end_date.includes('T')) {
      setFormData((prevData) => ({
        ...prevData,
        end_date: prevData.end_date.split('T')[0],
      }));
    }
  }, [formData.start_date, formData.end_date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, calculatedStatus); // Pass the calculated status to the parent onSubmit function
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || '', // Ensure all inputs are controlled by providing a default value
    }));
  };

  if (!show) return null; // Do not render the modal if `show` is false

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{editingProjectId ? 'Edit Project' : 'Create Project'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}> {/* Use the local handleSubmit function */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description (optional)</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="start_date" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="end_date" className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="budget" className="form-label">Budget</label>
                <input
                  type="number"
                  className="form-control"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <input
                  type="text"
                  className="form-control"
                  id="status"
                  name="status"
                  value={calculatedStatus.replace('_', ' ').toUpperCase()} // Display the calculated status
                  readOnly
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                {editingProjectId ? 'Update Project' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;