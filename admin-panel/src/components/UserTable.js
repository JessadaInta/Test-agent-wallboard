// components/UserTable.js
import React from 'react';
import UserActionButtons from './UserActionButtons';
import '../styles/UserTable.css';

const UserTable = ({ users, onEdit, onDelete }) => {
  console.log('🟢 UserTable rendered with', users.length, 'users');
  console.log('🟢 UserTable - onDelete type:', typeof onDelete);
  
  const handleEdit = (user) => {
    console.log('✏️ UserTable - handleEdit called with user:', user);
    onEdit(user);
  };
  
  const handleDelete = (user) => {
    console.log('🔴 UserTable - handleDelete called');
    console.log('🔴 UserTable - user:', user);
    console.log('🔴 UserTable - user.id:', user?.id);
    console.log('🔴 UserTable - user.username:', user?.username);
    
    if (!user || !user.id) {
      console.error('❌ UserTable - Invalid user object!');
      alert('Error: Invalid user data');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      console.log('🔴 UserTable - Confirmed deletion, calling onDelete with ID:', user.id);
      onDelete(user.id);
    } else {
      console.log('🔴 UserTable - Deletion cancelled');
    }
  };

  return React.createElement('div', { className: 'user-table-container' },
    React.createElement('table', { className: 'user-table' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', null, 'Username'),
          React.createElement('th', null, 'Full Name'),
          React.createElement('th', null, 'Role'),
          React.createElement('th', null, 'Team'),
          React.createElement('th', null, 'Status'),
          React.createElement('th', null, 'Created Date'),
          React.createElement('th', null, 'Actions')
        )
      ),
      React.createElement('tbody', null,
        users.length === 0 ?
          React.createElement('tr', null,
            React.createElement('td', { colSpan: 7, className: 'no-data' },
              'No users found. Click "Add New User" to create one.'
            )
          ) :
          users.map(user => {
            console.log('🟡 UserTable - Rendering row for user:', user.id, user.username);
            
            return React.createElement('tr', { key: user.id },
              React.createElement('td', null,
                React.createElement('span', { className: 'username' }, user.username)
              ),
              React.createElement('td', null, user.fullName),
              React.createElement('td', null,
                React.createElement('span', {
                  className: `role-badge role-${user.role.toLowerCase()}`
                }, user.role)
              ),
              React.createElement('td', null, user.teamName || '-'),
              React.createElement('td', null,
                React.createElement('span', {
                  className: `status-badge status-${user.status.toLowerCase()}`
                }, user.status)
              ),
              React.createElement('td', null,
                new Date(user.createdAt).toLocaleDateString('th-TH')
              ),
              React.createElement('td', null,
                React.createElement(UserActionButtons, {
                  user: user,
                  onEdit: () => handleEdit(user),
                  onDelete: () => handleDelete(user)
                })
              )
            );
          })
      )
    )
  );
};

export default UserTable;