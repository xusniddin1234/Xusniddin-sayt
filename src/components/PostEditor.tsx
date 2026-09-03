import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Eye,
  Save,
  Send,
  ArrowLeft,
  Sparkles,
  Bold,
  Italic,
  Heading,
  Quote,
  Code,
  List,
  Link2,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Category, Post } from '../types.ts';
import { ImageUploader } from './ImageUploader.tsx';

interface PostEditorProps {
  initialPost?: Post | null;
  categories: Category[];
  onSave: (postData: any) => Promise<boolean>;
  onCancel: () => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  categories,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [manualSlug, setManualSlug] = useState(!!initialPost);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [coverImageAlt, setCoverImageAlt] = useState(initialPost?.coverImageAlt || '');
  const [categoryId, setCategoryId] = useState<number | string>(
    initialPost?.categoryId || (categories[0]?.id ? String(categories[0].id) : '')
  );
  const [tagInput, setTagInput] = useState(
    initialPost?.tags?.map((t) => `#${t.name}`).join(' ') || ''
  );
  const [featured, setFeatured] = useState(initialPost?.featured || false);
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialPost?.status || 'published'
  );

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-generate slug from title if user hasn't typed a custom slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!manualSlug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'matn';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleSubmit = async (submitStatus?: 'draft' | 'published') => {
    setValidationError(null);

    const finalStatus = submitStatus || status;

    if (!title.trim()) {
      setValidationError('Sarlavha (Title) kiritilishi shart!');
      return;
    }
    if (!slug.trim()) {
      setValidationError('Slug kiritilishi shart!');
      return;
    }
    if (!content.trim()) {
      setValidationError('Maqola matni (Content) kiritilishi shart!');
      return;
    }
    if (!categoryId) {
      setValidationError('Kategoriya tanlanishi shart!');
      return;
    }

    const tagsArray = tagInput
      .split(/\s+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage,
        coverImageAlt,
        categoryId: Number(categoryId),
        featured,
        status: finalStatus,
        tags: tagsArray,
      };

      const success = await onSave(payload);
      if (!success) {
        setValidationError('Saqlashda xatolik yuz berdi. Iltimos qayta urinib ko‘ring.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="post-editor-container" className="max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-neutral-950 dark:text-white">
              {initialPost ? 'Maqolani tahrirlash' : 'Yangi maqola yaratish'}
            </h1>
            <p className="text-[11px] text-neutral-500">
              {status === 'published' ? 'Chop etish rejimi' : 'Qoralama (Draft) rejimi'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex-1 sm:flex-initial ${
              previewMode
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Tahrir' : 'Preview'}</span>
          </button>

          {/* Save as draft */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('draft')}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
          >
            <Save className="w-4 h-4" />
            <span>Qoralama</span>
          </button>

          {/* Publish */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('published')}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md disabled:opacity-50 w-full sm:w-auto"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'Chop etish'}</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main editor or Preview mode */}
      {previewMode ? (
        /* Preview Tab */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {categories.find((c) => String(c.id) === String(categoryId))?.name || 'Kategoriya'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white">
              {title || 'Sarlavha kiritilmagan'}
            </h1>
            {coverImage && (
              <img
                src={coverImage}
                alt={coverImageAlt || title}
                className="w-full max-h-96 object-cover rounded-xl"
              />
            )}
            <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
              <ReactMarkdown>{content || '*Maqola matni hali yozilmadi*'}</ReactMarkdown>
            </div>
          </div>
        </div>
      ) : (
        /* Form Inputs */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                  Maqola sarlavhasi (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Masalan: Sunʼiy intellektning yangi davri..."
                  className="w-full px-4 py-3 text-base sm:text-lg font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                  URL Manzili (Slug) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">/news/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setManualSlug(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="suniy-intellektning-yangi-davri"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1">
                  Qisqa taʼrif (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Bosh sahifa kartochkalarida ko‘rinadigan qisqa 1-2 jumlalik maʼlumot..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Markdown Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Maqola to‘liq matni (Markdown qo‘llab-quvvatlanadi) *
                  </label>
                  <span className="text-xs text-neutral-400">
                    {Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} daqiqa mutolaa
                  </span>
                </div>

                {/* Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-xl border border-b-0 border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Qalin (Bold)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Kursiv (Italic)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Sarlavha 2"
                  >
                    <Heading className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Iqtibos (Quote)"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```\n', '\n```')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Kod bloki"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('* ')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Ro‘yxat"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[havola matni](', ')')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Havola (Link)"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n---\n')}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Ajratuvchi chiziq"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  id="post-content-textarea"
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="## Kirish&#10;&#10;Ushbu maqolada muhim yangiliklar haqida batafsil so‘z boradi..."
                  className="w-full px-4 py-3 text-base rounded-b-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white font-mono leading-relaxed focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Right 1 Col: Metadata & Publishing sidebar */}
            <div className="space-y-6">
              {/* Cover Image Uploader */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
                <ImageUploader
                  value={coverImage}
                  altValue={coverImageAlt}
                  onChange={(url, alt) => {
                    setCoverImage(url);
                    if (alt !== undefined) setCoverImageAlt(alt);
                  }}
                />
              </div>

              {/* Category selector */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                    Kategoriya *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                    Teglar (bo‘sh joy bilan ajrating)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="#AI #NextJS #Programming"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Misol: #AI #Web #Kiberxavfsizlik
                  </p>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                    Holati (Status)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        status === 'published'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Chop etilgan
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                        status === 'draft'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      Qoralama (Draft)
                    </button>
                  </div>
                </div>

                {/* Featured checkbox */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-neutral-300"
                    />
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      Bosh sahifada katta bannerda ko‘rsatish (Featured)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
