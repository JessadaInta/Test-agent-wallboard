// services/authService.js
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

const authService = {
  loginWithoutPassword: async (username) => {
    try {
      // 1. ค้นหา agent จากฐานข้อมูล
      const agent = await userRepository.findByUsername(username);

      if (!agent) {
        throw new Error("Invalid username");
      }

      // 2. ตรวจสอบสถานะ Active
      if (!agent.isActive) {
        throw new Error("User account is inactive");
      }

      // 3. สร้าง JWT token
      const token = jwt.sign(
        {
          agentId: agent.id,
          username: agent.username,
          role: agent.role,
          teamId: agent.teamId,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // 4. อัปเดตเวลาล็อกอินล่าสุด (ถ้ามีคอลัมน์ last_login)
      if (userRepository.updateLastLogin) {
        await userRepository.updateLastLogin(agent.id);
      }

      // 5. ส่งข้อมูลกลับ
      return {
        success: true,
        user: {
          id: agent.id,
          username: agent.username,
          fullName: agent.fullName,
          role: agent.role,
          teamId: agent.teamId,
        },
        token,
        expiresIn: JWT_EXPIRES_IN,
      };
    } catch (error) {
      console.error("Error in loginWithoutPassword:", error);
      throw error;
    }
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error("Invalid or expired token");
    }
  },
};

module.exports = authService;
