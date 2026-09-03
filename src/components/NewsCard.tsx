import React from 'react';
import { ArrowUpRight, Clock, Eye, Calendar } from 'lucide-react';
import { Post } from '../types.ts';
import { formatDateUz } from '../translations.ts';

interface NewsCardProps {
  post: Post;
  onSelect: (slug: string) => void;
  onSelectCategory?: (slug: string) => void;
  onSelectTag?: (slug: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  post,
  onSelect,
  onSelectCategory,
  onSelectTag,
}) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

  return (
    <article
      id={`news-card-${post.id}`}
      onClick={() => onSelect(post.slug)}
      className="group relative flex flex-col bg-[#0A0A0A] border border-[#222222] rounded-[2px] overflow-hidden hover:border-[#F27D26]/60 active:bg-[#121212] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl"
    >
      {/* Card Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#121212]">
        <img
          src={post.coverImage || defaultImage}
          alt={post.coverImageAlt || post.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* Category Pill */}
        {post.categoryName && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectCategory && post.categorySlug) {
                  onSelectCategory(post.categorySlug);
                }
              }}
              className="inline-flex items-center min-h-[28px] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-[2px] bg-[#F27D26] text-black shadow-xs hover:bg-[#ff8f3d] transition-colors cursor-pointer"
            >
              {post.categoryName}
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 bg-[#080808]">
        {/* Metadata row with orange dot */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-2">
          <span>{formatDateUz(post.publishedAt || post.createdAt)}</span>
          <span className="w-1 h-1 bg-[#F27D26] rounded-full shrink-0"></span>
          <span>{post.readingTime || 3} min</span>
          <span className="w-1 h-1 bg-[#F27D26] rounded-full shrink-0"></span>
          <span className="ml-auto">{post.views} views</span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-[#F27D26] transition-colors mb-2 uppercase tracking-tight break-words">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xs text-[#888888] line-clamp-2 mb-3 leading-relaxed flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags row */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <button
                key={tag.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectTag) onSelectTag(tag.slug);
                }}
                className="inline-flex items-center min-h-[26px] px-2 py-0.5 rounded-[2px] text-[10px] uppercase tracking-wider text-[#666666] bg-[#121212] hover:text-[#F27D26] hover:bg-[#181818] transition-colors"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Footer with Read Link */}
        <div className="mt-auto pt-3 border-t border-[#222222] min-h-[36px] flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#777777] group-hover:text-[#F27D26] transition-colors">
          <span>Read Story</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </article>
  );
};
