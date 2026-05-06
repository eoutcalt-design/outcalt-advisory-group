import express from 'express';
import pool from '../db/init.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// Get all published blog posts (public)
router.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, slug, excerpt, featured_image, featured_image_alt, category, created_at FROM blog_posts WHERE published = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single blog post by slug (public)
router.get('/posts/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE slug = $1 AND published = true',
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get all posts for admin (protected)
router.get('/admin/posts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, slug, category, published, created_at FROM blog_posts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new blog post (protected)
router.post('/admin/posts', authMiddleware, async (req, res) => {
  const { title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update blog post (protected)
router.put('/admin/posts/:id', authMiddleware, async (req, res) => {
  const { title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE blog_posts 
       SET title = $1, slug = $2, excerpt = $3, body = $4, featured_image = $5, featured_image_alt = $6, category = $7, meta_description = $8, published = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete blog post (protected)
router.delete('/admin/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
