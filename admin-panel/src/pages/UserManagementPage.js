// pages/UserManagementPage.js
import React, { useState, useEffect } from 'react';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import { userAPI } from '../services/userAPI';
import { authAPI } from '../services/authAPI';
import '../styles/UserManagementPage.css';

const UserManagementPage = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  /**
   * Delete user
   */
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    setError(null);
    try {
      await userAPI.deleteUser(user.id);
      setSuccessMessage('User deleted successfully');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Save user (create or update)
   */
  const handleSaveUser = async (userData) => {
    setError(null);
    try {
      if (selectedUser) {
        // Edit mode
        await userAPI.updateUser(selectedUser.id, userData);
        setSuccessMessage('User updated successfully');
      } else {
        // Create mode
        await userAPI.createUser(userData);
        setSuccessMessage('User created successfully');
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return React.createElement('div', { className: 'user-management-page' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('div', null,
        React.createElement('h1', null, '👥 User Management'),
        React.createElement('p', { className: 'page-subtitle' },
          `Logged in as: ${currentUser?.fullName} (${currentUser?.username})`
        )
      ),
      React.createElement('div', { className: 'header-actions' },
        React.createElement('button', {
          className: 'btn btn-primary',
          onClick: handleCreateUser
        }, '+ Add New User'),
        React.createElement('button', {
          className: 'btn btn-secondary',
          onClick: onLogout
        }, '🚪 Logout')
      )
    ),

    successMessage && React.createElement('div', { className: 'alert alert-success' }, successMessage),
    error && React.createElement('div', { className: 'alert alert-error' }, error),

    loading ?
      React.createElement('div', { className: 'loading' }, '⏳ Loading users...') :
      React.createElement(UserTable, {
        users: users,
        onEdit: handleEditUser,
        onDelete: handleDeleteUser
      }),

    isModalOpen && React.createElement(UserFormModal, {
      user: selectedUser,
      onClose: () => setIsModalOpen(false),
      onSave: handleSaveUser
    })
  );
};

export default UserManagementPage;
