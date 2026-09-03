import React from 'react';
import { FolderTree, ArrowRight, Layers } from 'lucide-react';
import { Category } from '../types.ts';

interface CategoriesViewProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string) => void;
  onClearCategory: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onClearCategory,
}) => {
  return (
    <div id="categories-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26] mb-1">
            INDEXED TOPICS
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Mavzular va Kategoriyalar
          </h1>
          <p className="text-xs text-[#888888] mt-1 uppercase tracking-wider">
            Qiziqishingiz bo‘yicha maqolalar va so‘nggi yangiliklarni saralang
          </p>
        </div>

        {selectedCategorySlug && (
          <button
            onClick={onClearCategory}
            className="min-h-[44px] inline-flex items-center justify-center text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-[2px] border border-[#333333] bg-[#121212] text-[#888888] hover:text-white hover:border-[#666666] active:bg-[#181818] transition-colors cursor-pointer"
          >
            Filtrni bekor qilish
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`p-5 sm:p-6 rounded-[2px] border transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                isSelected
                  ? 'border-[#F27D26] bg-[#121212] shadow-xl'
                  : 'border-[#222222] bg-[#0A0A0A] hover:border-[#F27D26]/60 hover:bg-[#0D0D0D] active:bg-[#141414]'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-[2px] bg-[#141414] border border-[#222222] flex items-center justify-center text-[#F27D26] mb-4 group-hover:border-[#F27D26]/50 transition-all">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-[#F27D26] transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-[#888888] mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#222222] flex items-center justify-between text-[10px] uppercase tracking-wider text-[#666666]">
                <span className="font-bold text-white">
                  {cat.postCount ?? 0} maqola
                </span>
                <span className="flex items-center gap-1 font-black group-hover:text-[#F27D26] transition-colors">
                  <span>Ko‘rish</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
