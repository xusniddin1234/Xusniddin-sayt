import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
  BookOpen,
  FolderTree,
  Tag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { FeaturedHero } from './components/FeaturedHero.tsx';
import { NewsCard } from './components/NewsCard.tsx';
import { ArticleView } from './components/ArticleView.tsx';
import { CategoriesView } from './components/CategoriesView.tsx';
import { AboutView } from './components/AboutView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { Category, Post } from './types.ts';
import { t } from './translations.ts';

function MainApp() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeArticle, setActiveArticle] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);

  // Sync route from window.location
  const parseUrl = () => {
    const path = window.location.pathname;
    if (path.startsWith('/news/')) {
      const slug = path.replace('/news/', '').trim();
      if (slug) {
        setActiveArticleSlug(slug);
        setCurrentRoute('article');
        return;
      }
    }
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '').trim();
      if (slug) {
        setSelectedCategorySlug(slug);
        setCurrentRoute('news');
        return;
      }
    }
    if (path === '/admin') {
      setCurrentRoute('admin');
      return;
    }
    if (path === '/admin/login') {
      setCurrentRoute('admin-login');
      return;
    }
    if (path === '/categories') {
      setCurrentRoute('categories');
      return;
    }
    if (path === '/about') {
      setCurrentRoute('about');
      return;
    }
    if (path === '/news') {
      setCurrentRoute('news');
      return;
    }
    setCurrentRoute('home');
  };

  useEffect(() => {
    parseUrl();
    const handlePopState = () => parseUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route: string, slug?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (route === 'article' && slug) {
      setActiveArticleSlug(slug);
      setCurrentRoute('article');
      window.history.pushState({}, '', `/news/${slug}`);
      return;
    }
    if (route === 'category-filter' && slug) {
      setSelectedCategorySlug(slug);
      setSelectedTagSlug(null);
      setCurrentRoute('news');
      window.history.pushState({}, '', `/category/${slug}`);
      return;
    }
    if (route === 'tag-filter' && slug) {
      setSelectedTagSlug(slug);
      setSelectedCategorySlug(null);
      setCurrentRoute('news');
      window.history.pushState({}, '', `/news?tag=${slug}`);
      return;
    }

    setSelectedTagSlug(null);
    setCurrentRoute(route);
    if (route === 'home') window.history.pushState({}, '', '/');
    else if (route === 'news') window.history.pushState({}, '', '/news');
    else if (route === 'categories') window.history.pushState({}, '', '/categories');
    else if (route === 'about') window.history.pushState({}, '', '/about');
    else if (route === 'admin') window.history.pushState({}, '', '/admin');
    else if (route === 'admin-login') window.history.pushState({}, '', '/admin/login');
  };

  // Fetch Public Posts & Categories
  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      let url = '/api/posts?limit=30';
      if (selectedCategorySlug) {
        url += `&category=${encodeURIComponent(selectedCategorySlug)}`;
      }
      if (selectedTagSlug) {
        url += `&tag=${encodeURIComponent(selectedTagSlug)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCategorySlug, selectedTagSlug]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Fetch Article Detail when activeArticleSlug changes
  useEffect(() => {
    if (currentRoute === 'article' && activeArticleSlug) {
      setLoadingArticle(true);
      fetch(`/api/posts/${activeArticleSlug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setActiveArticle(data);
          if (data) {
            // fetch related
            fetch(`/api/related/${activeArticleSlug}`)
              .then((r) => (r.ok ? r.json() : []))
              .then((rel) => setRelatedPosts(rel));
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingArticle(false));
    }
  }, [currentRoute, activeArticleSlug]);

  // Featured post for Hero
  const featuredPost = useMemo(() => {
    return posts.find((p) => p.featured) || posts[0] || null;
  }, [posts]);

  // Remaining posts for grid
  const gridPosts = useMemo(() => {
    if (currentRoute === 'home' && featuredPost) {
      return posts.filter((p) => p.id !== featuredPost.id);
    }
    return posts;
  }, [posts, currentRoute, featuredPost]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white transition-colors selection:bg-[#F27D26] selection:text-black">
      {/* Navigation Bar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={(route) => navigateTo(route)}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* 1. Article Detail View */}
          {currentRoute === 'article' && (
            <motion.div
              key="article-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {loadingArticle ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F27D26] mb-3" />
                  <p className="text-xs uppercase tracking-widest text-[#888888]">Maqola yuklanmoqda...</p>
                </div>
              ) : activeArticle ? (
                <ArticleView
                  post={activeArticle}
                  relatedPosts={relatedPosts}
                  onBack={() => navigateTo('home')}
                  onSelectPost={(slug) => navigateTo('article', slug)}
                  onSelectCategory={(slug) => navigateTo('category-filter', slug)}
                  onSelectTag={(slug) => navigateTo('tag-filter', slug)}
                />
              ) : (
                <div className="py-24 text-center max-w-md mx-auto px-4">
                  <AlertCircle className="w-12 h-12 text-[#F27D26] mx-auto mb-3" />
                  <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Maqola topilmadi</h2>
                  <p className="text-xs text-[#888888] mb-6">
                    Siz qidirayotgan maqola o‘chirilgan yoki manzili o‘zgartirilgan bo‘lishi mumkin.
                  </p>
                  <button
                    onClick={() => navigateTo('home')}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-[2px] bg-[#F27D26] text-black hover:bg-[#ff8f3d] transition-colors"
                  >
                    Bosh sahifaga qaytish
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 2. Admin Dashboard or Login */}
          {currentRoute === 'admin' && (
            <motion.div
              key="admin-route"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {authLoading ? (
                <div className="py-24 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F27D26]" />
                </div>
              ) : isAdmin ? (
                <AdminDashboard
                  onNavigateHome={() => {
                    loadPosts();
                    loadCategories();
                    navigateTo('home');
                  }}
                  onViewPostPublic={(slug) => navigateTo('article', slug)}
                />
              ) : (
                <AdminLogin
                  onSuccess={() => {
                    loadPosts();
                    loadCategories();
                    navigateTo('admin');
                  }}
                  onBackToHome={() => navigateTo('home')}
                />
              )}
            </motion.div>
          )}

          {/* 3. Admin Login Standalone */}
          {currentRoute === 'admin-login' && (
            <motion.div
              key="admin-login-route"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminLogin
                onSuccess={() => {
                  loadPosts();
                  loadCategories();
                  navigateTo('admin');
                }}
                onBackToHome={() => navigateTo('home')}
              />
            </motion.div>
          )}

          {/* 4. Categories Page */}
          {currentRoute === 'categories' && (
            <motion.div
              key="categories-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CategoriesView
                categories={categories}
                selectedCategorySlug={selectedCategorySlug}
                onSelectCategory={(slug) => navigateTo('category-filter', slug)}
                onClearCategory={() => {
                  setSelectedCategorySlug(null);
                  loadPosts();
                }}
              />
            </motion.div>
          )}

          {/* 5. About Page */}
          {currentRoute === 'about' && (
            <motion.div
              key="about-route"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AboutView />
            </motion.div>
          )}

          {/* 6. Home or All News List */}
          {(currentRoute === 'home' || currentRoute === 'news') && (
            <motion.div
              key="home-news-route"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              {/* Category Quick Filter Chips (Editorial buttons) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none border-b border-[#222222] -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setSelectedTagSlug(null);
                  }}
                  className={`min-h-[38px] px-3.5 py-2 rounded-[2px] text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors cursor-pointer border ${
                    !selectedCategorySlug && !selectedTagSlug
                      ? 'bg-[#F27D26] text-black border-[#F27D26]'
                      : 'bg-[#121212] border-[#222222] text-[#888888] hover:text-white hover:border-[#444444]'
                  }`}
                >
                  Barcha maqolalar
                </button>
                {categories.map((cat) => {
                  const active = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (active) setSelectedCategorySlug(null);
                        else setSelectedCategorySlug(cat.slug);
                        setSelectedTagSlug(null);
                      }}
                      className={`min-h-[38px] px-3.5 py-2 rounded-[2px] text-[10px] font-black uppercase tracking-wider shrink-0 transition-colors cursor-pointer border ${
                        active
                          ? 'bg-[#F27D26] text-black border-[#F27D26]'
                          : 'bg-[#121212] border-[#222222] text-[#888888] hover:text-white hover:border-[#444444]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Tag or Category Filter Banner if active */}
              {(selectedCategorySlug || selectedTagSlug) && (
                <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-[2px] bg-[#121212] border border-[#222222] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Filter className="w-4 h-4 text-[#F27D26] shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#888888] truncate">
                      Filtrlangan:{' '}
                      <span className="text-white">
                        {selectedCategorySlug
                          ? `Kategoriya: ${
                              categories.find((c) => c.slug === selectedCategorySlug)?.name ||
                              selectedCategorySlug
                            }`
                          : `#${selectedTagSlug}`}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategorySlug(null);
                      setSelectedTagSlug(null);
                    }}
                    className="min-h-[36px] px-2 flex items-center text-[10px] font-black uppercase tracking-wider text-[#F27D26] hover:underline shrink-0 cursor-pointer"
                  >
                    Filtrni tozalash
                  </button>
                </div>
              )}

              {/* Hero Featured Card on Homepage when no filter is applied */}
              {currentRoute === 'home' &&
                !selectedCategorySlug &&
                !selectedTagSlug &&
                featuredPost && (
                  <FeaturedHero
                    post={featuredPost}
                    latestStories={posts.filter((p) => p.id !== featuredPost.id).slice(0, 4)}
                    onSelect={(slug) => navigateTo('article', slug)}
                    onViewAll={() => navigateTo('news')}
                    onSelectCategory={(slug) => navigateTo('category-filter', slug)}
                  />
                )}

              {/* Section Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222222]">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26] mb-1">
                    {currentRoute === 'home' ? 'EDITORIAL SELECTION' : 'STORIES ARCHIVE'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#F27D26]" />
                    <span>
                      {currentRoute === 'home'
                        ? t.home.latestNews
                        : t.nav.news}
                    </span>
                  </h2>
                </div>

                {currentRoute === 'home' && (
                  <button
                    onClick={() => navigateTo('news')}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#888888] hover:text-[#F27D26] transition-colors cursor-pointer"
                  >
                    <span>{t.home.viewAll}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Posts Grid */}
              {loadingPosts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                  {[1, 2, 3, 4, 5, 6].map((idx) => (
                    <div
                      key={idx}
                      className="rounded-[2px] border border-[#222222] p-4 space-y-3 animate-pulse bg-[#0A0A0A]"
                    >
                      <div className="aspect-[16/10] bg-[#1A1A1A] rounded-[2px]" />
                      <div className="h-3 bg-[#1A1A1A] rounded-[1px] w-1/3" />
                      <div className="h-5 bg-[#1A1A1A] rounded-[1px] w-4/5" />
                      <div className="h-3 bg-[#1A1A1A] rounded-[1px] w-full" />
                    </div>
                  ))}
                </div>
              ) : gridPosts.length === 0 ? (
                <div className="py-20 text-center rounded-[2px] border border-[#222222] bg-[#0A0A0A] p-8">
                  <BookOpen className="w-10 h-10 text-[#444444] mx-auto mb-3" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {t.home.noPosts}
                  </h3>
                  <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
                    Tanlangan mezon bo‘yicha maqolalar mavjud emas. Boshqa mavzuni tanlab ko‘ring yoki Admin paneldan yangi maqola qo‘shing.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => (
                    <NewsCard
                      key={post.id}
                      post={post}
                      onSelect={(slug) => navigateTo('article', slug)}
                      onSelectCategory={(slug) => navigateTo('category-filter', slug)}
                      onSelectTag={(slug) => navigateTo('tag-filter', slug)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={(route) => navigateTo(route)} />

      {/* Global Real-time Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPost={(slug) => navigateTo('article', slug)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
