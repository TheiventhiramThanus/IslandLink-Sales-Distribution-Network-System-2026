import { Coffee, UtensilsCrossed, Cookie, Grid3x3 } from 'lucide-react';
import type { Product } from '../../types';

interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  getCategoryCount: (category: string) => number;
}

export function CategorySidebar({ categories, selectedCategory, onSelectCategory, getCategoryCount }: CategorySidebarProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All':
        return Grid3x3;
      case 'Beverages':
        return Coffee;
      case 'Food':
        return UtensilsCrossed;
      case 'Snacks':
        return Cookie;
      default:
        return Grid3x3;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h3 className="text-lg text-gray-900 font-medium mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map(category => {
          const Icon = getCategoryIcon(category);
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${selectedCategory === category
                ? 'bg-blue-600 text-black text-black text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-black border border-gray-200'
                }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{category}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
                }`}>
                {getCategoryCount(category)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
