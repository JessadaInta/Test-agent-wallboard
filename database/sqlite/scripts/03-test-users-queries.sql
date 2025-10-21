-- Get all active users
SELECT * FROM users WHERE deletedAt IS NULL;

-- Get users by role
SELECT * FROM users WHERE role = 'Agent' AND deletedAt IS NULL;

-- Get user with team info
SELECT 
    u.id,
    u.username,
    u.fullName,
    u.role,
    t.team_name as teamName,
    u.status
FROM users u
LEFT JOIN teams t ON u.teamId = t.team_id
WHERE u.deletedAt IS NULL;

-- Count users by role
SELECT role, COUNT(*) as count FROM users WHERE deletedAt IS NULL GROUP BY role;

-- Find user by username
SELECT * FROM users WHERE username = 'AG001' AND deletedAt IS NULL;
