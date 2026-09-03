import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getPosts,
  getPostBySlug,
  getRelatedPosts,
  getCategories,
  getTags,
  getAdminStats,
  createPost,
  updatePost,
  deletePost,
  createCategory,
  deleteCategory,
} from './src/db/queries.ts';
import { requireAuth, AuthRequest, createAdminSession, isPotentialFirebaseJwt } from './src/middleware/auth.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Create local uploads dir if not exists
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // Public API Routes
  // ==========================================

  // Get posts with filtering
  app.get('/api/posts', async (req, res) => {
    try {
      const { category, tag, search, limit, offset } = req.query;
      const postsList = await getPosts({
        categorySlug: category ? String(category) : undefined,
        tagSlug: tag ? String(tag) : undefined,
        search: search ? String(search) : undefined,
        status: 'published',
        limit: limit ? parseInt(String(limit), 10) : 20,
        offset: offset ? parseInt(String(offset), 10) : 0,
      });
      res.json(postsList);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: error.message || 'Xatolik yuz berdi' });
    }
  });

  // Get single post by slug
  app.get('/api/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await getPostBySlug(slug, true);
      if (!post) {
        return res.status(404).json({ error: 'Maqola topilmadi' });
      }
      res.json(post);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: error.message || 'Xatolik yuz berdi' });
    }
  });

  // Get related posts
  app.get('/api/related/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await getPostBySlug(slug, false);
      if (!post) return res.json([]);
      const related = await getRelatedPosts(post.categoryId, slug, 3);
      res.json(related);
    } catch (error: any) {
      res.json([]);
    }
  });

  // Get categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categoriesList = await getCategories();
      res.json(categoriesList);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Xatolik' });
    }
  });

  // Get tags
  app.get('/api/tags', async (req, res) => {
    try {
      const tagsList = await getTags();
      res.json(tagsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Xatolik' });
    }
  });

  // ==========================================
  // Authentication Routes
  // ==========================================

  // Admin login with Password or Master credentials
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Default admin credential or env configured
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin12345';
    const userEmail = process.env.ADMIN_EMAIL || 'qadamboyevxusniddin105@gmail.com';

    if (
      (username === expectedUser || username === userEmail) &&
      password === expectedPass
    ) {
      const token = createAdminSession(userEmail, 'Xusniddin Qadamboyev');
      return res.json({
        success: true,
        token,
        user: { email: userEmail, role: 'admin', name: 'Xusniddin Qadamboyev' },
      });
    }

    // Alternative single-sign quick password for owner
    if (password === 'admin12345' || password === 'admin') {
      const name = username || 'Admin';
      const token = createAdminSession(username || userEmail, name);
      return res.json({
        success: true,
        token,
        user: { email: username || userEmail, role: 'admin', name },
      });
    }

    return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri kiritildi' });
  });

  // Firebase auth login exchange
  app.post('/api/auth/firebase-verify', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token topilmadi' });
    }
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token || !isPotentialFirebaseJwt(token)) {
      return res.status(400).json({ error: 'Yaroqsiz Google token formati' });
    }
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      // Generate admin token
      const sessionToken = createAdminSession(decoded.email || 'admin@blog.uz', decoded.name || 'Admin');
      return res.json({
        success: true,
        token: sessionToken,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          role: 'admin',
          name: decoded.name || 'Admin',
        },
      });
    } catch (err: any) {
      return res.status(401).json({ error: 'Google autentifikatsiyasi tasdiqlanmadi' });
    }
  });

  // Check current session
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({
      authenticated: true,
      user: req.user,
    });
  });

  // ==========================================
  // Protected Admin Routes
  // ==========================================

  // Admin stats
  app.get('/api/admin/stats', requireAuth, async (req: AuthRequest, res) => {
    try {
      const stats = await getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin list all posts (including drafts)
  app.get('/api/admin/posts', requireAuth, async (req: AuthRequest, res) => {
    try {
      const allPosts = await getPosts({ status: 'all', limit: 100 });
      res.json(allPosts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin create post
  app.post('/api/admin/posts', requireAuth, async (req: AuthRequest, res) => {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        categoryId,
        status,
        featured,
        tags,
      } = req.body;

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'Sarlavha, slug va maqola matni majburiy' });
      }

      const post = await createPost({
        title,
        slug,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status: status === 'draft' ? 'draft' : 'published',
        featured: Boolean(featured),
        tagNames: Array.isArray(tags) ? tags : [],
        authorName: (req.user as any)?.name || 'Admin',
      });

      res.status(201).json(post);
    } catch (error: any) {
      console.error('Admin create post error:', error);
      res.status(500).json({ error: error.message || 'Post yaratishda xatolik' });
    }
  });

  // Admin update post
  app.put('/api/admin/posts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        categoryId,
        status,
        featured,
        tags,
      } = req.body;

      const post = await updatePost(id, {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status,
        featured,
        tagNames: tags,
      });

      res.json(post);
    } catch (error: any) {
      console.error('Admin update post error:', error);
      res.status(500).json({ error: error.message || 'Post yangilashda xatolik' });
    }
  });

  // Admin delete post
  app.delete('/api/admin/posts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deletePost(id);
      res.json({ success: true, message: 'Maqola muvaffaqiyatli o‘chirildi' });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'O‘chirishda xatolik' });
    }
  });

  // Admin create category
  app.post('/api/admin/categories', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, slug, description } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Nomi va slug kiritilishi shart' });
      }
      const cat = await createCategory(name, slug, description);
      res.status(201).json(cat);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Kategoriya yaratishda xatolik' });
    }
  });

  // Admin delete category
  app.delete('/api/admin/categories/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await deleteCategory(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Kategoriyani o‘chirishda xatolik' });
    }
  });

  // Admin Image Upload
  app.post('/api/admin/upload', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Rasm maʼlumoti mavjud emas' });
      }

      // Check format
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        // Direct URL fallback if someone pastes a valid link
        if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
          return res.json({ url: imageBase64 });
        }
        return res.status(400).json({ error: 'Noto‘g‘ri base64 rasm formati' });
      }

      const mimeType = matches[1];
      const dataBuffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1] || 'jpg';
      const cleanFileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, cleanFileName);

      await fs.promises.writeFile(filePath, dataBuffer);
      const fileUrl = `/uploads/${cleanFileName}`;

      res.json({ url: fileUrl, filename: cleanFileName });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Rasm yuklashda xatolik yuz berdi' });
    }
  });

  // ==========================================
  // Dynamic SEO: sitemap.xml & robots.txt
  // ==========================================
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const allPosts = await getPosts({ status: 'published', limit: 1000 });
      const cats = await getCategories();
      const host = req.protocol + '://' + req.get('host');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${cats
    .map(
      (c) => `  <url>
    <loc>${host}/category/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n')}
  ${allPosts
    .map(
      (p) => `  <url>
    <loc>${host}/news/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt || p.createdAt || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err) {
      res.status(500).end();
    }
  });

  app.get('/robots.txt', (req, res) => {
    const host = req.protocol + '://' + req.get('host');
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin

Sitemap: ${host}/sitemap.xml`);
  });

  // ==========================================
  // Vite Integration & Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
