import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, ArrowRight, Loader2, FileText } from 'lucide-react';
import { Post } from '../types.ts';
import { formatDateUz, t } from '../translations.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPost,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/posts?search=${encodeURIComponent(query.trim())}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-start justify-center pt-4 sm:pt-24 px-3 sm:px-4 p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="search-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#080808] border border-[#222222] rounded-[2px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 py-3 border-b border-[#222222] gap-2.5 bg-[#0A0A0A]">
          <Search className="w-4 h-4 text-[#F27D26] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="QIDIRISH..."
            className="flex-1 min-h-[40px] bg-transparent text-sm sm:text-base font-bold text-white placeholder-[#555555] focus:outline-hidden uppercase tracking-wider"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#F27D26] shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#777777] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="min-h-[36px] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-[2px] bg-[#141414] text-[#888888] border border-[#262626] hover:text-white active:bg-[#202020] cursor-pointer"
          >
            Yopish
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 divide-y divide-[#1A1A1A]">
          {query.trim() && !loading && results.length === 0 && (
            <div className="py-12 text-center text-[#666666] text-xs uppercase tracking-wider">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#888888]" />
              <p>{t.search.noResults}</p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-[#555555] text-[11px] uppercase tracking-widest">
              Mavzu, texnologiya yoki maqola sarlavhasini yozishni boshlang...
            </div>
          )}

          {results.map((post) => (
            <button
              key={post.id}
              onClick={() => {
                onSelectPost(post.slug);
                onClose();
              }}
              className="w-full text-left p-3.5 rounded-[2px] bg-[#0A0A0A] hover:bg-[#121212] transition-colors flex items-center justify-between group cursor-pointer border border-[#222222] hover:border-[#F27D26]/60"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1.5 text-[9px] uppercase tracking-wider font-bold text-[#555555]">
                  {post.categoryName && (
                    <span className="text-[#F27D26] font-black">
                      {post.categoryName}
                    </span>
                  )}
                  <span>•</span>
                  <span>{formatDateUz(post.publishedAt || post.createdAt)}</span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-[#F27D26] transition-colors line-clamp-1 uppercase tracking-tight">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="text-xs text-[#888888] line-clamp-1 mt-1">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#555555] group-hover:text-[#F27D26] group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
