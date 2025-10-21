const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Agent = require('../models/Agent');
const userRepository = require('../repositories/userRepository'); // 🆕 Add this

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/**
 * POST /api/auth/login
 * Agent/Supervisor/Admin login (unified endpoint)
 */
router.post('/login', async (req, res) => {
  try {
    const { agentCode, supervisorCode, adminCode } = req.body;
   
    // Determine login type and extract code
    const code = (agentCode || supervisorCode || adminCode || '').toUpperCase();
   
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required (agentCode, supervisorCode, or adminCode)'
      });
    }

    console.log('Login attempt with code:', code); // Debug log
   
    // 🆕 Check if it's an admin code (starts with AD)
    if (code.startsWith('AD')) {
      console.log('Admin login attempt'); // Debug log
      
      // Find admin user from users table
      const user = await userRepository.findByUsername(code);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid admin credentials'
        });
      }

      console.log('Admin user found:', user); // Debug log

      // Generate JWT token for admin
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Response for admin
      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: user.role // Make sure this is 'admin' (lowercase)
          },
          token: token
        }
      });
    }
   
    // Handle agent/supervisor login (existing logic)
    const user = await Agent.findByCode(code);
   
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
   
    // For supervisors, get team members
    let teamData = null;
    if (user.role === 'supervisor') {
      teamData = await Agent.findByTeam(user.team_id);
    }
   
    // Generate JWT token
    const token = jwt.sign(
      {
        agentCode: user.agent_code,
        role: user.role,
        teamId: user.team_id
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
   
    // Response for agent/supervisor
    res.json({
      success: true,
      data: {
        user: {
          agentCode: user.agent_code,
          agentName: user.agent_name,
          teamId: user.team_id,
          teamName: user.team_name,
          role: user.role,
          email: user.email
        },
        teamData: teamData,
        token: token
      }
    });
   
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;