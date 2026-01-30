import { ShoppingCart, Lock } from 'lucide-react';
import { ImageWithFallback } from '../layout/figma/ImageWithFallback';
import { formatPrice } from '../../utils/currencyUtils';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
  onAddToCart: (product: Product) => void;
  onLoginPrompt: () => void;
  onViewDetails: (product: Product) => void;
  currency: 'USD' | 'LKR';
}

export function ProductCard({ product, isAuthenticated, onAddToCart, onLoginPrompt, onViewDetails, currency }: ProductCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'In Stock': return 'status-in-stock';
      case 'Low Stock': return 'status-low-stock';
      case 'Critical': return 'status-critical';
      default: return '';
    }
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="card-image-wrap" onClick={() => onViewDetails(product)}>
        <ImageWithFallback
          src={product.image || `https://images.unsplash.com/photo-1600000000000-0000?w=400&h=400&fit=crop`}
          alt={product.name}
        />
        <div className={`card-status-badge ${getStatusClass(product.status)}`}>
          {product.status}
        </div>
      </div>

      {/* Product Details */}
      <div className="card-content">
        <div className="card-category">{product.category}</div>
        <h3 className="card-title" onClick={() => onViewDetails(product)}>
          {product.name}
        </h3>

        <div className="card-price-row">
          <span className="card-price">{formatPrice(product.price, currency)}</span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button
            onClick={() => onViewDetails(product)}
            className="btn-details"
          >
            View Details
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.status === 'Critical'}
              className="btn-cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.status === 'Critical' ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          ) : (
            <button
              onClick={onLoginPrompt}
              className="btn-details"
              style={{ background: '#f5f5f5', color: '#666' }}
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
