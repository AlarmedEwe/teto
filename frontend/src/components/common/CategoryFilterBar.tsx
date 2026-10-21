import React from 'react';
import { CategorySummaryItemDTO } from '@teto/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { resolveCategoryIcon } from './CategoryIcon.js';

interface CategoryFilterBarProps {
  categories: CategorySummaryItemDTO[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none no-scrollbar">
      {showAllOption && (
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          title="Todas as categorias"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            selectedCategoryId === null
              ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80 bg-neutral-900/60 border border-neutral-800/80'
          }`}
        >
          <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
          <span>Todos</span>
        </button>
      )}

      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.categoryId;
        const iconDef = resolveCategoryIcon(cat.icon, cat.name);

        return (
          <button
            key={cat.categoryId}
            type="button"
            onClick={() => onSelectCategory(isSelected ? null : cat.categoryId)}
            title={`${cat.name} (${cat.targetPct}%)`}
            className={`group relative flex items-center justify-center transition-all duration-200 shrink-0 ${
              isSelected
                ? 'w-8 h-8 rounded-full text-white shadow-lg ring-2 ring-white/20'
                : 'w-8 h-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/80'
            }`}
            style={
              isSelected
                ? { backgroundColor: cat.colorHex || '#f59e0b' }
                : undefined
            }
          >
            <FontAwesomeIcon icon={iconDef} className="text-sm transition-transform group-hover:scale-110" />
            
            {/* Tooltip no hover */}
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 border border-neutral-700/80 px-2 py-0.5 text-[10px] font-medium text-neutral-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-30">
              {cat.name} ({cat.targetPct}%)
            </span>
          </button>
        );
      })}
    </div>
  );
};
