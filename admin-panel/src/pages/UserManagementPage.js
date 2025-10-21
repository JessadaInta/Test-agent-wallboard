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
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getAllUsers();
      console.log('👥 UserManagementPage - Loaded users:', data);
      setUsers(data);
    } catch (err) {
      console.error('❌ UserManagementPage - Load error:', err);
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
    console.log('✏️ UserManagementPage - handleEditUser called with:', user);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    console.log('🔴 UserManagementPage - handleDeleteUser called');
    console.log('🔴 UserManagementPage - userId:', userId);
    console.log('🔴 UserManagementPage - userId type:', typeof userId);
    
    if (!userId) {
      console.error('❌ UserManagementPage - No user ID provided!');
      setError('Cannot delete: User ID is missing');
      return;
    }
    
    setError(null);
    
    try {
      console.log('🔴 UserManagementPage - Calling userAPI.deleteUser with:', userId);
      await userAPI.deleteUser(userId);
      setSuccessMessage('User deleted successfully');
      await loadUsers();
    } catch (err) {
      console.error('❌ UserManagementPage - Delete error:', err);
      setError(err.message);
    }
  };

  const handleSaveUser = async (userData) => {
    setError(null);
    try {
      if (selectedUser) {
        await userAPI.updateUser(selectedUser.id, userData);
        setSuccessMessage('User updated successfully');
      } else {
        await userAPI.createUser(userData);
        setSuccessMessage('User created successfully');
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1>👥 User Management</h1>
          <p className="page-subtitle">
            {`Logged in as: ${currentUser?.fullName} (${currentUser?.username})`}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleCreateUser}>
            + Add New User
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">⏳ Loading users...</div>
      ) : (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {isModalOpen && (
        <UserFormModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserManagementPage;