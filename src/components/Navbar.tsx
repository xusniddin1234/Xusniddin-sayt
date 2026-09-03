import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  Sun,
  Moon,
  ShieldCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { t } from '../translations.ts';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t.nav.home, route: 'home' },
    { label: t.nav.news, route: 'news' },
    { label: t.nav.categories, route: 'categories' },
    { label: t.nav.about, route: 'about' },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 w-full h-16 border-b border-[#222222] bg-[#050505]/90 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        {/* Brand Logo & Editorial Nav */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter italic text-[#F27D26] transition-transform group-hover:scale-105">
              UX.EDITION
            </span>
            <span className="hidden lg:inline-block text-[9px] font-bold uppercase tracking-[0.25em] text-[#555555] border-l border-[#222222] pl-3 py-0.5">
              XUSNIDDIN.DEV
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#888888]" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  id={`nav-link-${link.route}`}
                  onClick={() => handleLinkClick(link.route)}
                  className={`transition-colors cursor-pointer py-1 ${
                    isActive
                      ? 'text-white border-b-2 border-[#F27D26]'
                      : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar / Button (Icon on mobile, input on sm+) */}
          <button
            id="navbar-search-btn"
            onClick={onOpenSearch}
            className="w-10 h-10 sm:w-44 sm:h-9 bg-[#121212] border border-[#222222] rounded-[2px] sm:rounded-full flex items-center justify-center sm:justify-between px-0 sm:px-3 text-[10px] text-[#888888] hover:text-white hover:border-[#555555] transition-colors cursor-pointer shrink-0"
            title="Qidirish (Ctrl + K yoki /)"
            aria-label="Qidirish"
          >
            <span className="hidden sm:inline-block truncate">Search news...</span>
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1 text-[9px] font-mono text-[#555555] bg-[#1a1a1a] rounded">
                /
              </kbd>
              <Search className="w-4 h-4 sm:w-3 sm:h-3 text-[#F27D26]" />
            </div>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Rejimni o‘zgartirish"
            className="w-10 h-10 rounded-[2px] sm:rounded-full border border-[#222222] flex items-center justify-center bg-[#121212] hover:border-[#555555] transition-colors cursor-pointer text-[#888888] hover:text-[#F27D26] shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F27D26]" />
            ) : (
              <Moon className="w-4 h-4 text-[#888888]" />
            )}
          </button>

          {/* Admin Action Button - desktop only, mobile has it in drawer and bottom nav */}
          <div className="hidden sm:block">
            {isAdmin ? (
              <button
                id="navbar-admin-btn"
                onClick={() => handleLinkClick('admin')}
                className="px-3.5 py-2 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-wider rounded-[2px] hover:bg-[#ff8f3d] transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => handleLinkClick('admin-login')}
                className="px-3.5 py-2 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-wider rounded-[2px] hover:bg-[#ff8f3d] transition-colors cursor-pointer min-h-[36px]"
                title="Admin kirish"
              >
                Admin
              </button>
            )}
          </div>

          {/* Mobile hamburger - 44px tap target */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center border border-[#222222] bg-[#121212] rounded-[2px] text-[#cccccc] hover:text-white hover:border-[#444444] cursor-pointer"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#F27D26]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden border-b border-[#222222] bg-[#0A0A0A] px-5 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleLinkClick(link.route)}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-[2px] text-left text-xs font-black uppercase tracking-[0.2em] cursor-pointer transition-colors ${
                currentRoute === link.route
                  ? 'bg-[#141414] text-[#F27D26] border-l-2 border-[#F27D26]'
                  : 'text-[#888888] hover:bg-[#121212] hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
          <div className="pt-3 mt-2 border-t border-[#222222] flex items-center justify-between">
            <button
              onClick={() => handleLinkClick('admin')}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#141414] border border-[#262626] rounded-[2px] text-[10px] font-black uppercase tracking-widest text-[#F27D26] hover:bg-[#1f1f1f] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin tizimiga kirish'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
