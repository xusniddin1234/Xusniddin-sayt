import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Send,
  Twitter,
  Facebook,
  Link2,
  Check,
  Tag,
  Share2,
} from 'lucide-react';
import { Post } from '../types.ts';
import { formatDateUz, t } from '../translations.ts';
import { NewsCard } from './NewsCard.tsx';

interface ArticleViewProps {
  post: Post;
  relatedPosts: Post[];
  onBack: () => void;
  onSelectPost: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
  onSelectTag: (slug: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  relatedPosts,
  onBack,
  onSelectPost,
  onSelectCategory,
  onSelectTag,
}) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(currentUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="article-detail-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-white">
      {/* Back button with 44px touch target */}
      <button
        id="back-to-home-btn"
        onClick={onBack}
        className="min-h-[44px] inline-flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-widest text-[#888888] hover:text-[#F27D26] active:text-[#ff8f3d] transition-colors mb-6 sm:mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#F27D26]" />
        <span>{t.article.backToHome}</span>
      </button>

      {/* Header Info */}
      <header className="mb-6 sm:mb-8 space-y-4">
        {/* Category Pill */}
        {post.categoryName && (
          <div>
            <button
              onClick={() => post.categorySlug && onSelectCategory(post.categorySlug)}
              className="inline-flex items-center min-h-[30px] px-3 py-1 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-wider rounded-[2px] hover:bg-[#ff8f3d] transition-colors cursor-pointer"
            >
              {post.categoryName}
            </button>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.1] break-words">
          {post.title}
        </h1>

        {/* Meta details */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#777777] pt-3 pb-3 border-y border-[#222222]">
          <div className="flex items-center gap-1.5">
            <span className="text-white">By {post.authorName || 'Xusniddin Qadamboyev'}</span>
          </div>

          <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>

          <span>{formatDateUz(post.publishedAt || post.createdAt)}</span>

          <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>

          <span>{post.readingTime || 4} min read</span>

          <span className="w-1.5 h-1.5 bg-[#F27D26] rounded-full shrink-0"></span>

          <span>{post.views} views</span>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <figure className="mb-8 sm:mb-10 rounded-[2px] overflow-hidden border border-[#222222] bg-[#0A0A0A]">
          <img
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            referrerPolicy="no-referrer"
            className="w-full max-h-[340px] sm:max-h-[540px] object-cover"
          />
          {post.coverImageAlt && (
            <figcaption className="p-2.5 sm:p-3 text-center text-[10px] uppercase tracking-wider text-[#666666] bg-[#080808] border-t border-[#222222]">
              {post.coverImageAlt}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article Content / Markdown */}
      <article className="max-w-none mb-10 sm:mb-12 text-[#cccccc] text-base sm:text-lg leading-[1.8] space-y-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-white mt-8 sm:mt-10 mb-3 sm:mb-4 tracking-tight break-words">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-white mt-6 sm:mt-8 mb-2 sm:mb-3 tracking-tight break-words">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base sm:text-lg md:text-xl font-black uppercase text-white mt-5 sm:mt-6 mb-2 break-words">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-base sm:text-lg leading-relaxed text-[#b0b0b0] mb-5 break-words">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-[#F27D26] pl-4 sm:pl-5 py-2.5 sm:py-3 my-5 sm:my-6 italic text-[#dddddd] bg-[#0D0D0D] border-y border-r border-[#222222] text-sm sm:text-base">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mb-5 text-base sm:text-lg text-[#b0b0b0]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 sm:pl-6 space-y-2 mb-5 text-base sm:text-lg text-[#b0b0b0]">
                {children}
              </ol>
            ),
            pre: ({ children }) => (
              <pre className="p-3 sm:p-4 rounded-[2px] bg-[#0A0A0A] text-[#f0f0f0] font-mono text-xs sm:text-sm overflow-x-auto max-w-full my-5 sm:my-6 border border-[#222222]">
                {children}
              </pre>
            ),
            code: ({ children }) => (
              <code className="px-1.5 py-0.5 rounded-[2px] bg-[#141414] text-[#F27D26] font-mono text-xs border border-[#222222] break-all">
                {children}
              </code>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto w-full my-6 border border-[#222222] rounded-[2px]">
                <table className="w-full text-left text-xs sm:text-sm">{children}</table>
              </div>
            ),
            hr: () => (
              <hr className="my-8 border-[#222222]" />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 pt-4 border-t border-[#222222]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#666666] flex items-center gap-1 mr-2">
            <Tag className="w-3 h-3" />
            Teglar:
          </span>
          {post.tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.slug)}
              className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[#121212] text-[#888888] border border-[#222222] hover:text-white hover:border-[#F27D26] transition-colors cursor-pointer"
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Social Sharing Bar with 44px mobile touch targets */}
      <div
        id="social-share-bar"
        className="rounded-[2px] border border-[#222222] bg-[#080808] p-4 sm:p-5 mb-12 sm:mb-14 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Share2 className="w-4 h-4 text-[#F27D26]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            Maqolani ulashing:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[#0088cc] hover:bg-[#0077b5] text-white transition-colors"
            title="Telegram orqali ulashish"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[#161616] hover:bg-[#202020] text-white border border-[#333333] transition-colors"
            title="X (Twitter) orqali ulashish"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-wider bg-[#1877f2] hover:bg-[#166fe5] text-white transition-colors"
            title="Facebook orqali ulashish"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-wider border border-[#333333] bg-[#121212] text-[#cccccc] hover:text-white hover:border-[#666666] active:bg-[#1c1c1c] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#F27D26]" />
                <span className="text-[#F27D26] font-bold">Nusxalandi!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Nusxalash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section id="related-posts-section" className="pt-8 border-t border-[#222222]">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26] mb-1">
            CONTINUE READING
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-6">
            {t.article.relatedTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <NewsCard
                key={rPost.id}
                post={rPost}
                onSelect={onSelectPost}
                onSelectCategory={onSelectCategory}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
