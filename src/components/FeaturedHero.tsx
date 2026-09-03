import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Post } from '../types.ts';
import { formatDateUz } from '../translations.ts';

interface FeaturedHeroProps {
  post: Post;
  latestStories?: Post[];
  onSelect: (slug: string) => void;
  onViewAll?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  post,
  latestStories = [],
  onSelect,
  onViewAll,
  onSelectCategory,
}) => {
  const defaultImage =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80';

  const hasSidebarStories = latestStories && latestStories.length > 0;

  return (
    <section id="hero-featured-post" className="relative w-full mb-10">
      <div className="grid grid-cols-12 gap-px bg-[#222222] border border-[#222222] rounded-[2px] overflow-hidden shadow-2xl">
        {/* Main Featured Editorial Story (8 cols or 12 if no sidebar) */}
        <div
          onClick={() => onSelect(post.slug)}
          className={`${
            hasSidebarStories ? 'col-span-12 lg:col-span-8' : 'col-span-12'
          } bg-[#050505] relative group cursor-pointer overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[580px] flex flex-col justify-end`}
        >
          {/* Background Image with Zoom & Dark Wash */}
          <div className="absolute inset-0 z-0 overflow-hidden bg-[#121212]">
            <img
              src={post.coverImage || defaultImage}
              alt={post.coverImageAlt || post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-40 group-hover:opacity-50"
            />
            {/* Dark Editorial Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/25 z-10" />
            
            {/* Watermark Monogram / Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-10 opacity-15 overflow-hidden max-w-full">
              <span className="text-[50px] sm:text-[140px] lg:text-[220px] font-black tracking-tighter text-white uppercase font-sans whitespace-nowrap block">
                FEATURED
              </span>
            </div>
          </div>

          {/* Foreground Editorial Content */}
          <div className="relative z-20 p-4 sm:p-8 lg:p-12 w-full">
            {/* Category Tag */}
            <div className="mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
              <span
                onClick={(e) => {
                  if (post.categorySlug && onSelectCategory) {
                    e.stopPropagation();
                    onSelectCategory(post.categorySlug);
                  }
                }}
                className="inline-flex items-center min-h-[28px] px-3 py-1 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-wider rounded-[2px] shadow-sm hover:bg-[#ff8f3d] transition-colors"
              >
                {post.categoryName || 'TECHNOLOGY'}
              </span>
              <span className="inline-flex items-center min-h-[28px] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#888888] border border-[#333333] rounded-[2px] bg-black/50 backdrop-blur-xs">
                FEATURED STORY
              </span>
            </div>

            {/* Massive Magazine Headline */}
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.08] sm:leading-[0.95] tracking-tight sm:tracking-tighter uppercase mb-3 sm:mb-6 text-white group-hover:text-[#F27D26] transition-colors break-words">
              {post.title}
            </h1>

            {/* Editorial Excerpt */}
            {post.excerpt && (
              <p className="text-[#888888] text-xs sm:text-base lg:text-lg max-w-2xl mb-4 sm:mb-6 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Metadata with Orange Dot Dividers */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#777777] pt-2 sm:pt-3 border-t border-[#222222]">
              <span className="text-white">By {post.authorName || 'Xusniddin Qadamboyev'}</span>
              <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>
              <span>{post.readingTime || 4} min read</span>
              <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>
              <span>{formatDateUz(post.publishedAt || post.createdAt)}</span>
              <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>
              <span>{post.views} views</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Latest Stories List (4 cols) */}
        {hasSidebarStories && (
          <aside className="col-span-12 lg:col-span-4 bg-[#050505] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#222222]">
            {/* Section Header */}
            <div className="p-4 sm:p-6 border-b border-[#222222] flex items-center justify-between">
              <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-[#F27D26]">
                Latest Stories
              </h2>
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="min-h-[36px] px-2 flex items-center text-[10px] text-[#777777] hover:text-white underline uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              )}
            </div>

            {/* Story Items */}
            <div className="flex-1 flex flex-col divide-y divide-[#222222]">
              {latestStories.slice(0, 4).map((story) => (
                <div
                  key={story.id}
                  onClick={() => onSelect(story.slug)}
                  className="p-4 sm:p-6 hover:bg-[#0A0A0A] active:bg-[#121212] transition-colors cursor-pointer group flex flex-col justify-center flex-1 min-h-[72px]"
                >
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-[#555555] mb-1 block tracking-wider group-hover:text-[#888888] transition-colors">
                    {story.categoryName || 'DEVELOPMENT'}
                  </span>
                  <h3 className="text-xs sm:text-base font-bold leading-snug group-hover:text-[#F27D26] transition-colors mb-1.5 text-white line-clamp-2 break-words">
                    {story.title}
                  </h3>
                  <div className="text-[9px] sm:text-[10px] text-[#555555] font-medium uppercase tracking-tight flex items-center gap-2">
                    <span>{formatDateUz(story.publishedAt || story.createdAt)}</span>
                    <span>•</span>
                    <span>{story.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
};
