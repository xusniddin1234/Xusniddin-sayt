import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ImageUploaderProps {
  value?: string | null;
  altValue?: string | null;
  onChange: (url: string, alt?: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  altValue,
  onChange,
}) => {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState(altValue || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayllarini yuklash mumkin!');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploading(true);
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageBase64: base64,
            filename: file.name,
          }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          onChange(data.url, altText);
        } else {
          // Fallback to direct base64
          onChange(base64, altText);
        }
      } catch (err) {
        console.error('Upload failed, using base64 data URL:', err);
        onChange(base64, altText);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim(), altText);
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
        Muqova rasmi (Cover Image)
      </label>

      {/* Current image preview if exists */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950 aspect-[16/9] max-h-64 group">
          <img
            src={value}
            alt={altText || 'Cover preview'}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('', '')}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-900/80 text-white hover:bg-rose-600 transition-colors shadow-lg cursor-pointer"
            title="Rasmni o‘chirish"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 bg-neutral-900/80 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-xs">
            Yuklangan rasm
          </div>
        </div>
      ) : (
        /* Upload box */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Rasm yuklanmoqda va optimallashtirilmoqda...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Rasmni bu yerga tashlang yoki fayl tanlang
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                PNG, JPG, WebP, GIF (maksimal 15MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL or Alt row */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Rasm tavsifi / Alt text (SEO uchun)..."
          value={altText}
          onChange={(e) => {
            setAltText(e.target.value);
            if (value) onChange(value, e.target.value);
          }}
          className="flex-1 w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
        />

        {!showUrlInput ? (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-emerald-500 flex items-center gap-1 shrink-0 py-1"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Havola (URL) orqali kiritish</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white flex-1"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-2.5 py-1.5 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-lg shrink-0"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
