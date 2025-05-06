import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const TaskModal = ({ show, onHide, onSave, task, projectId, teamMembers }) => {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [startDate, setStartDate] = useState(task?.start_date || '');
  const [endDate, setEndDate] = useState(task?.end_date || '');
  const [status, setStatus] = useState(task?.status || 'not_started');
  const [priority, setPriority] = useState(task?.priority || 'low');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimated_hours || '');
  const [assignedMembers, setAssignedMembers] = useState(task?.team_member_ids || []);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setStartDate(task.start_date);
      setEndDate(task.end_date);
      setStatus(task.status);
      setPriority(task.priority);
      setEstimatedHours(task.estimated_hours);
      setAssignedMembers(task.team_member_ids);
    }
  }, [task]);

  const handleSave = () => {
    const taskData = {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      status,
      priority,
      estimated_hours: estimatedHours,
      team_member_ids: assignedMembers,
      project_id: projectId,
    };
    onSave(taskData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{task ? 'Edit Task' : 'Create Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Task Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estimated Hours</Form.Label>
            <Form.Control
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="Enter estimated hours"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assign Team Members</Form.Label>
            <Form.Select
              multiple
              value={assignedMembers}
              onChange={(e) =>
                setAssignedMembers(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskModal;