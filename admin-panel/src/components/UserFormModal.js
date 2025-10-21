import React, { useState, useEffect } from 'react';
import '../styles/UserFormModal.css';

const UserFormModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'Agent',
    teamId: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        teamId: user.teamId || '',
        status: user.status
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else {
      const roleCode = formData.username.substring(0, 2);
      const numPart = formData.username.substring(2);
      if (
        !['AG', 'SP', 'AD'].includes(roleCode) ||
        isNaN(numPart) ||
        numPart.length !== 3
      ) {
        newErrors.username = 'Invalid username format';
      }
    }

    // Full Name
    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Team for Agent/Supervisor
    if (
      (formData.role === 'Agent' || formData.role === 'Supervisor') &&
      !formData.teamId
    ) {
      newErrors.teamId = 'Team is required for Agent and Supervisor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="user-form">
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., AG001, SP001, AD001"
              disabled={!!user}
              className={errors.username ? 'error' : ''}
            />
            <small className="hint">
              Format: AG001-AG999 (Agent), SP001-SP999 (Supervisor), AD001-AD999 (Admin)
            </small>
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={errors.fullName ? 'error' : ''}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role">
              Role <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'error' : ''}
            >
              <option value="Agent">Agent</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Team */}
          <div className="form-group">
            <label htmlFor="teamId">Team</label>
            <select
              id="teamId"
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              className={errors.teamId ? 'error' : ''}
            >
              <option value="">-- Select Team --</option>
              <option value="1">Team Alpha</option>
              <option value="2">Team Beta</option>
              <option value="3">Team Gamma</option>
            </select>
            <small className="hint">Required for Agent and Supervisor roles</small>
            {errors.teamId && <span className="error-message">{errors.teamId}</span>}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">
              Status <span className="required">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;