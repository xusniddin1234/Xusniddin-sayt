import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  ArrowLeft,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { AdminStats, Category, Post } from '../types.ts';
import { formatDateUz, t } from '../translations.ts';
import { PostEditor } from './PostEditor.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onViewPostPublic: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateHome,
  onViewPostPublic,
}) => {
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Subview
  const [view, setView] = useState<'dashboard' | 'new-post' | 'edit-post' | 'categories'>('dashboard');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Modals & Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  // Filter in table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // Load all admin posts
      const postsRes = await fetch('/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }

      // Load categories
      const catsRes = await fetch('/api/categories');
      if (catsRes.ok) {
        setCategories(await catsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Create or Update Post
  const handleSavePost = async (payload: any) => {
    try {
      const isEditing = !!editingPost;
      const url = isEditing ? `/api/admin/posts/${editingPost.id}` : '/api/admin/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchData();
        setView('dashboard');
        setEditingPost(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving post:', err);
      return false;
    }
  };

  // Toggle publish / unpublish
  const handleToggleStatus = async (post: Post) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    try {
      const res = await fetch(`/api/admin/posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
        setDeleteModalOpen(false);
        setPostToDelete(null);
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    if (!newCatName.trim() || !newCatSlug.trim()) {
      setCatError('Kategoriya nomi va slug kiritilishi shart!');
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCatName.trim(),
          slug: newCatSlug.trim().toLowerCase(),
          description: newCatDesc.trim(),
        }),
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatSlug('');
        setNewCatDesc('');
        fetchData();
      } else {
        const err = await res.json();
        setCatError(err.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      setCatError(err.message);
    }
  };

  // Filtered posts for table
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (view === 'new-post') {
    return (
      <PostEditor
        categories={categories}
        onSave={handleSavePost}
        onCancel={() => setView('dashboard')}
      />
    );
  }

  if (view === 'edit-post' && editingPost) {
    return (
      <PostEditor
        initialPost={editingPost}
        categories={categories}
        onSave={handleSavePost}
        onCancel={() => {
          setView('dashboard');
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div id="admin-panel-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
              {t.admin.title}
            </h1>
            <p className="text-xs text-neutral-500">
              {user?.email || 'admin@blog.uz'} • Boshqaruv tizimi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setView('new-post')}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-transform active:scale-98 cursor-pointer flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin.newPost}</span>
          </button>

          <button
            onClick={() => setView(view === 'categories' ? 'dashboard' : 'categories')}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 cursor-pointer"
          >
            <FolderTree className="w-4 h-4" />
            <span>{view === 'categories' ? 'Maqolalarga qaytish' : 'Kategoriyalar'}</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:bg-neutral-200 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Saytga o‘tish</span>
          </button>

          <button
            onClick={logout}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Jami maqolalar</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white">
            {stats?.totalPosts ?? posts.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Chop etilgan</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.publishedPosts ?? posts.filter((p) => p.status === 'published').length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Qoralamalar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats?.drafts ?? posts.filter((p) => p.status === 'draft').length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kategoriyalar</span>
            <FolderTree className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-neutral-950 dark:text-white">
            {stats?.categories ?? categories.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Jami ko‘rishlar</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats?.totalViews ?? posts.reduce((acc, curr) => acc + curr.views, 0)}
          </p>
        </div>
      </div>

      {/* View: Categories Management */}
      {view === 'categories' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Category Form */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs h-fit">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Yangi kategoriya qo‘shish
            </h3>
            {catError && (
              <p className="text-xs text-rose-500 mb-3 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                {catError}
              </p>
            )}
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Kategoriya nomi *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'));
                  }}
                  placeholder="Masalan: Sunʼiy intellekt"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Slug (URL identifikatori) *
                </label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="suniy-intellekt"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqa taʼrifi
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Kategoriya haqida qisqacha maʼlumot..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                Kategoriyani saqlash
              </button>
            </form>
          </div>

          {/* List Categories */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-4">
              Mavjud kategoriyalar ({categories.length})
            </h3>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {categories.map((cat) => (
                <div key={cat.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                      {cat.name}
                    </h4>
                    <span className="text-xs font-mono text-neutral-500">
                      /category/{cat.slug}
                    </span>
                    {cat.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                      {cat.postCount ?? 0} ta maqola
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View: Posts Table */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Filters */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Maqola sarlavhasini qidirish..."
                className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-neutral-500 shrink-0">Holat:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="min-h-[44px] flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="all">Barchasi ({posts.length})</option>
                <option value="published">Faqat chop etilganlar</option>
                <option value="draft">Faqat qoralamalar</option>
              </select>
            </div>
          </div>

          {/* Mobile Cards List (Phones) */}
          <div className="md:hidden divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                Hech qanday maqola topilmadi.
              </div>
            ) : (
              filteredPosts.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    {p.coverImage && (
                      <img
                        src={p.coverImage}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-neutral-800"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-neutral-950 dark:text-white leading-snug break-words">
                        {p.title}
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                        /news/{p.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {p.categoryName || '—'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {p.views} views • {formatDateUz(p.publishedAt || p.createdAt)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        p.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{p.status === 'published' ? 'Chop etilgan' : 'Qoralama'}</span>
                    </button>
                  </div>

                  {/* Actions row with 44px touch targets */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                    <button
                      onClick={() => onViewPostPublic(p.slug)}
                      className="min-h-[40px] flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-neutral-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Ko‘rish</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingPost(p);
                        setView('edit-post');
                      }}
                      className="min-h-[40px] flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-neutral-700"
                    >
                      <Edit className="w-3.5 h-3.5 text-sky-500" />
                      <span>Tahrirlash</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostToDelete(p);
                        setDeleteModalOpen(true);
                      }}
                      className="min-h-[40px] flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 active:bg-rose-100 dark:active:bg-rose-900/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>O‘chirish</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop/Tablet Posts Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 font-semibold">
                  <th className="py-3 px-4">Maqola</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4">Ko‘rishlar</th>
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      Hech qanday maqola topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-neutral-950 dark:text-white max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-3">
                          {p.coverImage && (
                            <img
                              src={p.coverImage}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="truncate">
                            <span className="block truncate font-bold text-sm">
                              {p.title}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400 block truncate">
                              /news/{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {p.categoryName || '—'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                            p.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          }`}
                          title="Holatni o‘zgartirish uchun bosing"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{p.status === 'published' ? 'Chop etilgan' : 'Qoralama'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-neutral-500">
                        {p.views}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-neutral-500">
                        {formatDateUz(p.publishedAt || p.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View */}
                          <button
                            onClick={() => onViewPostPublic(p.slug)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Saytda ko‘rish"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingPost(p);
                              setView('edit-post');
                            }}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-sky-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setPostToDelete(p);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t.admin.deleteConfirmTitle}
        message={`"${postToDelete?.title}" maqolasini butunlay o‘chirmoqchimisiz?`}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
