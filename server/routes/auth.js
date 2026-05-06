import express from 'express';
import pool from '../db/init.js';
import { generateToken, hashPassword, comparePassword, authMiddleware } from '../auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Check credentials against environment variables if database is not available
    if (!pool) {
      const envUsername = 'admin';
      const envPassword = process.env.ADMIN_PASSWORD || 'changeme';
      
      if (username === envUsername && password === envPassword) {
        const token = generateToken(1);
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.json({ token, message: 'Login successful' });
      } else {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Use database if available
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Change password (protected)
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords required' });
  }

  try {
    // If no database, reject password changes
    if (!pool) {
      return res.status(400).json({ error: 'Password changes not available without database configuration' });
    }

    const result = await pool.query('SELECT * FROM admin_users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await hashPassword(newPassword);
    await pool.query('UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ authenticated: true });
});

export default router;
