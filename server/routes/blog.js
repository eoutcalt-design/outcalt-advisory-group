import express from 'express';
import { authMiddleware } from '../auth.js';
import pool from '../db/init.js';

const router = express.Router();

// Get all published blog posts (public)
router.get('/posts', async (req, res) => {
  try {
    if (!pool) {
      return res.json([]);
    }
    
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
    if (!pool) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
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
    if (!pool) {
      return res.json([]);
    }
    
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
    if (!pool) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    if (!title || !slug || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO blog_posts (title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update blog post (protected)
router.put('/admin/posts/:id', authMiddleware, async (req, res) => {
  const { title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published } = req.body;
  const { id } = req.params;

  try {
    if (!pool) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const result = await pool.query(
      `UPDATE blog_posts 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           excerpt = COALESCE($3, excerpt),
           body = COALESCE($4, body),
           featured_image = COALESCE($5, featured_image),
           featured_image_alt = COALESCE($6, featured_image_alt),
           category = COALESCE($7, category),
           meta_description = COALESCE($8, meta_description),
           published = COALESCE($9, published),
           updated_at = NOW()
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
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete blog post (protected)
router.delete('/admin/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    if (!pool) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get single post for editing (protected)
router.get('/admin/posts/:id', authMiddleware, async (req, res) => {
  try {
    if (!pool) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [req.params.id]
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

export default router;
