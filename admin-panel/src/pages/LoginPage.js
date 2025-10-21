import React, { useState } from 'react';
import { authAPI } from '../services/authAPI';
import '../styles/LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate username format
      const usernameRegex = /^(AG|SV|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/;
      if (!usernameRegex.test(username)) {
        setError('Invalid username format. Use AG, SV, or AD followed by 3 digits');
        setLoading(false);
        return;
      }

      // Check if it's an admin code
      if (!username.startsWith('AD')) {
        setError('Only admin accounts (AD) can access this panel');
        setLoading(false);
        return;
      }

      // Login
      const result = await authAPI.login(username);
      
      console.log('Login result:', result);

      // Check if user is Admin (case-insensitive check)
      const userRole = result.user?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        setError(`Access denied. Admin role required. (Current role: ${result.user?.role})`);
        authAPI.logout();
        setLoading(false);
        return;
      }

      // Success
      onLoginSuccess();
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'login-container' },
    React.createElement('div', { className: 'login-box' },
      React.createElement('h1', { className: 'login-title' }, '🔐 Admin Panel'),
      React.createElement('p', { className: 'login-subtitle' }, 'User Management System'),
      
      React.createElement('form', { onSubmit: handleSubmit, className: 'login-form' },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'username' }, 'Admin Username'),
          React.createElement('input', {
            type: 'text',
            id: 'username',
            value: username,
            onChange: (e) => setUsername(e.target.value.toUpperCase()),
            placeholder: 'AD001',
            required: true,
            autoFocus: true,
            maxLength: 5,
            className: error ? 'error' : ''
          }),
          React.createElement('small', { className: 'hint' }, 'Format: AD001-AD999')
        ),
        
        error && React.createElement('div', { className: 'alert alert-error' }, '⚠️ ', error),
        
        React.createElement('button', {
          type: 'submit',
          className: 'btn btn-primary',
          disabled: loading || !username
        }, loading ? 'Logging in...' : 'Login')
      ),
      
      React.createElement('div', { className: 'login-footer' },
        React.createElement('p', null, '💡 Test Accounts:'),
        React.createElement('ul', null,
          React.createElement('li', null, 'AD001 - Admin One'),
          React.createElement('li', null, 'AD002 - Admin Two')
        )
      )
    )
  );
};

export default LoginPage;