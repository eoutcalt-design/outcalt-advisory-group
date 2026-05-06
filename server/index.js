import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeDatabase } from './db/init.js';
import { hashPassword } from './auth.js';
import pool from './db/init.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);

// Admin dashboard route - serve admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Blog page route
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/blog.html'));
});

// Single blog post route
app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/blog-post.html'));
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Check if admin user exists, if not create one
    const adminCheck = await pool.query('SELECT * FROM admin_users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'changeme';
      const hashedPassword = await hashPassword(defaultPassword);
      await pool.query(
        'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
        ['admin', hashedPassword]
      );
      console.log('Default admin user created. Username: admin, Password: ' + defaultPassword);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
