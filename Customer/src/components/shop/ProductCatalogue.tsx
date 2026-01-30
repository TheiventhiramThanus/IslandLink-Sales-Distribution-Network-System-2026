import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3x3, List, ArrowUpDown, Loader2, Package, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { productService } from '../../services/api';
import './ProductCatalogue.css';
import type { Product, Page } from '../../types';

interface ProductCatalogueProps {
  isAuthenticated: boolean;
  onNavigate: (page: Page) => void;
  onAddToCart: (product: Product) => void;
  cartItemCount: number;
  fullPage?: boolean;
  currency: 'USD' | 'LKR';
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export function ProductCatalogue({ isAuthenticated, onNavigate, onAddToCart, fullPage = false, currency }: ProductCatalogueProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Could not load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      default: return 0;
    }
  });

  const getCategoryCount = (category: string) => {
    if (category === 'All') return products.length;
    return products.filter(p => p.category === category).length;
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/product/${product.id || product._id}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 text-black animate-spin mb-4" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className={fullPage ? 'min-h-screen bg-gray-50' : 'bg-white'}>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl text-gray-900 mb-4 font-bold tracking-tight">Product Catalogue</h2>
          <p className="text-gray-500 font-medium text-lg">
            {isAuthenticated
              ? 'Browse our curated selection and place your orders'
              : 'Browse our full inventory - Join us to unlock ordering'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Category Pills */}
        <div className="category-scroll">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-pill ${selectedCategory === category ? 'active' : 'inactive'}`}
            >
              <span>{category}</span>
              <span className="category-count">
                {getCategoryCount(category)}
              </span>
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="catalogue-controls">
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="sort-select"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600 text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid/List */}
        {sortedProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? 'product-catalogue-grid' : 'space-y-4'}>
            {sortedProducts.map((product) => (
              viewMode === 'grid' ? (
                <ProductCard
                  key={product._id}
                  product={{ ...product, id: product._id as string }}
                  isAuthenticated={isAuthenticated}
                  onAddToCart={onAddToCart}
                  onLoginPrompt={() => onNavigate('login')}
                  onViewDetails={handleViewDetails}
                  currency={currency}
                />
              ) : (
                <ProductListItem
                  key={product._id}
                  product={{ ...product, id: product._id as string }}
                  isAuthenticated={isAuthenticated}
                  onAddToCart={onAddToCart}
                  onLoginPrompt={() => onNavigate('login')}
                  onViewDetails={handleViewDetails}
                  currency={currency}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
