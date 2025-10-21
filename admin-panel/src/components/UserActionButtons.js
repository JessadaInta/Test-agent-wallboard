// components/UserActionButtons.js
import React from 'react';
import '../styles/UserActionButtons.css';

const UserActionButtons = ({ user, onEdit, onDelete }) => {
  console.log('🔵 UserActionButtons rendered with user:', user);
  
  const handleDelete = () => {
    console.log('🔴 UserActionButtons - handleDelete called');
    console.log('🔴 UserActionButtons - user object:', user);
    console.log('🔴 UserActionButtons - user.id:', user?.id);
    console.log('🔴 UserActionButtons - onDelete type:', typeof onDelete);
    
    // Call onDelete - it should already handle confirmation in UserTable
    onDelete();
  };

  const handleEdit = () => {
    console.log('✏️ UserActionButtons - handleEdit called');
    onEdit();
  };

  return React.createElement('div', { className: 'action-buttons' },
    React.createElement('button', {
      className: 'btn-action btn-edit',
      onClick: handleEdit,
      title: 'Edit user'
    }, '✏️ Edit'),
    
    React.createElement('button', {
      className: 'btn-action btn-delete',
      onClick: handleDelete,
      title: 'Delete user'
    }, '🗑️ Delete')
  );
};

export default UserActionButtons;