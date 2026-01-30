import { ShoppingCart, Lock, Package, DollarSign } from 'lucide-react';
import { ImageWithFallback } from '../layout/figma/ImageWithFallback';
import { formatPrice } from '../../utils/currencyUtils';
import type { Product } from '../../types';

interface ProductListItemProps {
  product: Product;
  isAuthenticated: boolean;
  onAddToCart: (product: Product) => void;
  onLoginPrompt: () => void;
  onViewDetails: (product: Product) => void;
  currency: 'USD' | 'LKR';
}

export function ProductListItem({ product, isAuthenticated, onAddToCart, onLoginPrompt, onViewDetails, currency }: ProductListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-lg overflow-hidden group">
      <div className="flex flex-col sm:flex-row">
        {/* Product Image */}
        <div
          className="w-full sm:w-48 h-48 bg-gray-100 relative overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
          <ImageWithFallback
            src={`https://images.unsplash.com/photo-1600000000000-0000?w=400&h=400&fit=crop`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-blue-600 text-black font-medium bg-blue-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <h3
                  className="text-xl text-gray-900 font-medium mb-1 cursor-pointer hover:text-blue-600 text-black transition-colors"
                  onClick={() => onViewDetails(product)}
                >
                  {product.name}
                </h3>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                  <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                </div>
              </div>

              {/* Price - Desktop */}
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end text-blue-600 text-black mb-1">
                  <span className="text-2xl font-bold">{formatPrice(product.price, currency)}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">per unit</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 flex-1">
              {product.description}
            </p>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto">
              {/* Price - Mobile */}
              <div className="sm:hidden">
                <div className="flex items-center text-blue-600 text-black">
                  <span className="text-2xl font-bold">{formatPrice(product.price, currency)}</span>
                  <span className="text-sm text-gray-500 ml-2 font-medium">per unit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:ml-auto">
                <button
                  onClick={() => onViewDetails(product)}
                  className="px-4 py-2 text-blue-600 text-black border border-blue-600 text-black rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.status === 'Critical'}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${product.status === 'Critical'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-black text-black text-white hover:bg-blue-700'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.status === 'Critical' ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                ) : (
                  <button
                    onClick={onLoginPrompt}
                    className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Login to Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
