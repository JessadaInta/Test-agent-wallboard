// repositories/userRepository.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path (ใช้ database เดิม)
const dbPath = path.join(__dirname, '../../database/sqlite/wallboard.db');

/**
 * User Repository - Data Access Layer
 */
class UserRepository {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('✅ UserRepository connected to SQLite database');
        // 🆕 เปิดใช้งาน Foreign Key constraints
        this.db.run('PRAGMA foreign_keys = ON');
      }
    });
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.team_name as teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM users u
        LEFT JOIN teams t ON u.teamId = t.team_id
        WHERE u.deletedAt IS NULL
      `;
      
      const params = [];
      
      // Add filters
      if (filters.role) {
        query += ' AND u.role = ?';
        params.push(filters.role);
      }
      
      if (filters.status) {
        query += ' AND u.status = ?';
        params.push(filters.status);
      }
      
      if (filters.teamId) {
        query += ' AND u.teamId = ?';
        params.push(filters.teamId);
      }
      
      query += ' ORDER BY u.createdAt DESC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.team_name as teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM users u
        LEFT JOIN teams t ON u.teamId = t.team_id
        WHERE u.id = ? AND u.deletedAt IS NULL
      `;
      
      this.db.get(query, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.fullName,
          u.role,
          u.teamId,
          t.team_name as teamName,
          u.status,
          u.createdAt,
          u.updatedAt,
          u.lastLoginAt
        FROM users u
        LEFT JOIN teams t ON u.teamId = t.team_id
        WHERE u.username = ? AND u.deletedAt IS NULL
      `;
      
      this.db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Create new user
   */
  async create(userData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (username, fullName, role, teamId, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const params = [
        userData.username,
        userData.fullName,
        userData.role,
        userData.teamId || null,
        userData.status || 'Active'
      ];
      
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          // Return the created user
          const newUserId = this.lastID;
          resolve({ id: newUserId, ...userData });
        }
      });
    });
  }

  /**
   * Update user
   */
  async update(userId, userData) {
    return new Promise((resolve, reject) => {
      let setClause = 'updatedAt = CURRENT_TIMESTAMP';
      const params = [];
      
      if (userData.fullName !== undefined) {
        setClause += ', fullName = ?';
        params.push(userData.fullName);
      }
      
      if (userData.role !== undefined) {
        setClause += ', role = ?';
        params.push(userData.role);
      }

      if (userData.teamId !== undefined) {
        setClause += ', teamId = ?';
        params.push(userData.teamId || null); 
      }
      
      if (userData.status !== undefined) {
        setClause += ', status = ?';
        params.push(userData.status);
      }
      
      params.push(userId);
      
      const query = `
        UPDATE users 
        SET ${setClause}
        WHERE id = ? AND deletedAt IS NULL
      `;
      
      console.log('Repository - Update query:', query);
      console.log('Repository - Update params:', params);
      
      this.db.run(query, params, function(err) {
        if (err) {
          console.error('Repository - Update error:', err);
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('User not found or already deleted'));
        } else {
          console.log('Repository - Update successful');
          resolve({ id: userId, ...userData });
        }
      });
    });
  }

  /**
   * Soft delete user
   */
  async softDelete(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET status = 'Inactive', 
            deletedAt = CURRENT_TIMESTAMP,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND deletedAt IS NULL
      `;
      
      this.db.run(query, [userId], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('User not found or already deleted'));
        } else {
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  /**
   * Hard delete user (permanent removal)
   */
  async hardDelete(userId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM users WHERE id = ?`;
      
      this.db.run(query, [userId], function(err) {
        if (err) {
          console.error('❌ Hard delete error:', err);
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('User not found'));
        } else {
          console.log(`✅ Hard deleted user ID: ${userId}`);
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET lastLoginAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  /**
   * Check if username exists
   */
  async usernameExists(username) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE username = ? AND deletedAt IS NULL
      `;
      
      this.db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });
  }
}

module.exports = new UserRepository();