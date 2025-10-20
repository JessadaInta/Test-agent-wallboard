// repositories/userRepository.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ✅ ใช้ฐานข้อมูล wallboard.db เดิม
const dbPath = path.join(__dirname, "../../database/sqlite/wallboard.db");

/**
 * User Repository (ใช้ agents table แทน Users)
 */
class UserRepository {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Error connecting to database:", err);
      } else {
        console.log("✅ UserRepository connected to SQLite database");
        this.db.run("PRAGMA foreign_keys = ON");
      }
    });
  }

  /**
   * 🔍 ค้นหาทั้งหมด (optional filters)
   */
  async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          a.agent_id AS id,
          a.agent_code AS username,
          a.agent_name AS fullName,
          a.team_id AS teamId,
          t.team_name AS teamName,
          a.role,
          a.is_active AS isActive,
          a.created_at AS createdAt
        FROM agents a
        LEFT JOIN teams t ON a.team_id = t.team_id
        WHERE 1=1
      `;

      const params = [];

      if (filters.isActive !== undefined) {
        query += " AND a.is_active = ?";
        params.push(filters.isActive ? 1 : 0);
      }

      if (filters.teamId) {
        query += " AND a.team_id = ?";
        params.push(filters.teamId);
      }

      query += " ORDER BY a.agent_id ASC";

      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  /**
   * 🔍 ค้นหาจาก agent_id
   */
  async findById(agentId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.agent_id AS id,
          a.agent_code AS username,
          a.agent_name AS fullName,
          a.team_id AS teamId,
          t.team_name AS teamName,
          a.role,
          a.is_active AS isActive,
          a.created_at AS createdAt
        FROM agents a
        LEFT JOIN teams t ON a.team_id = t.team_id
        WHERE a.agent_id = ?
      `;
      this.db.get(query, [agentId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * 🔍 ค้นหาด้วย username (agent_code)
   */
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `
      SELECT 
        a.agent_id AS id,
        a.agent_code AS username,
        a.agent_name AS fullName,
        a.team_id AS teamId,
        t.team_name AS teamName,
        a.role,
        a.is_active AS isActive,
        a.created_at AS createdAt
      FROM agents a
      LEFT JOIN teams t ON a.team_id = t.team_id
      WHERE LOWER(a.agent_code) = LOWER(?)
    `;
      this.db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * 🕓 อัปเดตเวลาล็อกอินล่าสุด (ไม่มีใน schema นี้ → ข้าม)
   */
  async updateLastLogin(agentId) {
    return Promise.resolve(true);
  }

  /**
   * 🧩 ปิดการใช้งาน (Soft delete)
   */
  async softDelete(agentId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE agents
        SET is_active = 0
        WHERE agent_id = ?
      `;
      this.db.run(query, [agentId], function (err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  }

  /**
   * ✅ ตรวจสอบว่ามี agent_code แล้วหรือยัง
   */
  async usernameExists(username) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) AS count 
        FROM agents 
        WHERE agent_code = ?
      `;
      this.db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });
  }
}

module.exports = new UserRepository();
