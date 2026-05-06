# Outcalt Advisory Group - Full Stack Website with Blog

A professional advisory website with an integrated blog management system, built with Node.js, Express, and PostgreSQL.

## Features

- **Marketing Pages**: Homepage, Strategic Deal Architecture, Business Exit Positioning
- **Admin Blog System**: Full CRUD operations for blog posts
- **Image Upload**: Drag-and-drop image uploads with alt text for SEO
- **Authentication**: Secure admin login with JWT tokens
- **Database**: PostgreSQL for persistent data storage
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Authentication**: JWT + bcryptjs

## Deployment on Render

### Prerequisites

1. GitHub account with the code repository
2. Render account (create at render.com)
3. PostgreSQL database (Render provides this)

### Step-by-Step Deployment

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Render**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure Environment**
   - Set up PostgreSQL database in Render
   - Add environment variables:
     - `DATABASE_URL`: (auto-filled by Render)
     - `JWT_SECRET`: (generate a secure key)
     - `ADMIN_USERNAME`: admin
     - `ADMIN_PASSWORD`: (set a strong password)
     - `NODE_ENV`: production

4. **Deploy**
   - Render will automatically build and deploy
   - Your site will be available at `https://your-app-name.onrender.com`

## Local Development

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/outcalt
   JWT_SECRET=your_secret_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=changeme
   NODE_ENV=development
   PORT=3000
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

4. Access the site:
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

## Admin Access

Default credentials:
- **Username**: admin
- **Password**: (set in environment variables)

### Change Password

1. Log in to admin panel
2. Go to Settings
3. Enter current password and new password
4. Click "Update Password"

## Blog Management

### Create a Blog Post

1. Log in to admin panel
2. Click "+ New Post"
3. Fill in:
   - Post Title
   - Excerpt (shown in blog listing)
   - Body Content (use formatting toolbar)
   - Featured Image (drag & drop)
   - ALT Text for image (SEO)
   - Category
   - URL Slug (auto-generated)
   - Meta Description (for Google)
4. Choose Draft or Publish
5. Click "Save Post"

### Edit a Blog Post

1. Click "Edit" next to the post in the list
2. Make changes
3. Click "Save Post"

### Delete a Blog Post

1. Click "Delete" next to the post in the list
2. Confirm deletion

## File Structure

```
outcalt-render/
├── public/                 # Static files and HTML
│   ├── index.html         # Homepage
│   ├── admin.html         # Admin dashboard
│   ├── style.css          # Styling
│   ├── assets/            # Images and media
│   └── uploads/           # User-uploaded images
├── server/
│   ├── index.js           # Express server
│   ├── auth.js            # Authentication utilities
│   ├── db/
│   │   └── init.js        # Database initialization
│   └── routes/
│       ├── auth.js        # Auth endpoints
│       ├── blog.js        # Blog endpoints
│       └── upload.js      # Image upload endpoint
├── package.json           # Dependencies
├── render.yaml            # Render deployment config
└── .env.example           # Environment variables template
```

## API Endpoints

### Public Endpoints

- `GET /api/blog/posts` - Get all published blog posts
- `GET /api/blog/posts/:slug` - Get single blog post

### Protected Endpoints (Require Auth)

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify token
- `GET /api/blog/admin/posts` - Get all posts (admin)
- `POST /api/blog/admin/posts` - Create post
- `PUT /api/blog/admin/posts/:id` - Update post
- `DELETE /api/blog/admin/posts/:id` - Delete post
- `POST /api/upload/upload` - Upload image

## Troubleshooting

### Database Connection Error

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials

### Admin Login Not Working

- Clear browser cookies
- Check ADMIN_USERNAME and ADMIN_PASSWORD in .env
- Verify JWT_SECRET is set

### Images Not Uploading

- Check file size (max 10MB)
- Verify file format (JPG, PNG, WebP, GIF)
- Ensure `/public/uploads/blog` directory exists

## Support

For issues or questions, contact the development team.

## License

© 2026 Outcalt Advisory Group. All rights reserved.
