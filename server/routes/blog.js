import express from 'express';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// In-memory blog storage (since database is not configured)
let blogPosts = [];
let postIdCounter = 1;

// Get all published blog posts (public)
router.get('/posts', async (req, res) => {
  try {
    const publishedPosts = blogPosts
      .filter(post => post.published)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(({ id, title, slug, excerpt, featured_image, featured_image_alt, category, created_at }) => ({
        id, title, slug, excerpt, featured_image, featured_image_alt, category, created_at
      }));
    res.json(publishedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single blog post by slug (public)
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = blogPosts.find(p => p.slug === req.params.slug && p.published);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get all posts for admin (protected)
router.get('/admin/posts', authMiddleware, async (req, res) => {
  try {
    const adminPosts = blogPosts
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(({ id, title, slug, category, published, created_at }) => ({
        id, title, slug, category, published, created_at
      }));
    res.json(adminPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create new blog post (protected)
router.post('/admin/posts', authMiddleware, async (req, res) => {
  const { title, slug, excerpt, body, featured_image, featured_image_alt, category, meta_description, published } = req.body;

  try {
    if (!title || !slug || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPost = {
      id: postIdCounter++,
      title,
      slug,
      excerpt,
      body,
      featured_image,
      featured_image_alt,
      category,
      meta_description,
      published: published || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    blogPosts.push(newPost);
    res.status(201).json(newPost);
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
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    blogPosts[postIndex] = {
      ...blogPosts[postIndex],
      title: title || blogPosts[postIndex].title,
      slug: slug || blogPosts[postIndex].slug,
      excerpt: excerpt || blogPosts[postIndex].excerpt,
      body: body || blogPosts[postIndex].body,
      featured_image: featured_image || blogPosts[postIndex].featured_image,
      featured_image_alt: featured_image_alt || blogPosts[postIndex].featured_image_alt,
      category: category || blogPosts[postIndex].category,
      meta_description: meta_description || blogPosts[postIndex].meta_description,
      published: published !== undefined ? published : blogPosts[postIndex].published,
      updated_at: new Date().toISOString()
    };

    res.json(blogPosts[postIndex]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete blog post (protected)
router.delete('/admin/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const postIndex = blogPosts.findIndex(p => p.id === parseInt(id));
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const deletedPost = blogPosts.splice(postIndex, 1);
    res.json({ message: 'Post deleted successfully', id: deletedPost[0].id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get single post for editing (protected)
router.get('/admin/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = blogPosts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

export default router;
