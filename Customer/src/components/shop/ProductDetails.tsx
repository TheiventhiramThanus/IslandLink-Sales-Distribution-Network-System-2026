import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Tag, Info, Package } from 'lucide-react';
import { productService } from '../../services/api';
import { formatPrice } from '../../utils/currencyUtils';
import { ImageWithFallback } from '../layout/figma/ImageWithFallback';
import type { Product } from '../../types';
import './ProductDetails.css';

interface ProductDetailsProps {
    currency: 'USD' | 'LKR';
    onAddToCart: (product: Product) => void;
    isAuthenticated: boolean;
}

export function ProductDetails({ currency, onAddToCart, isAuthenticated }: ProductDetailsProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                const res = await productService.getAll(); // Using getAll then filtering as a fallback for demo
                const foundProduct = res.data.find((p: any) => p._id === id || p.id === id);
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    // Try to fetch by ID directly if API supports it
                    // const resById = await productService.getById(id);
                    // setProduct(resById.data);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="product-details-container"><p>Loading product details...</p></div>;
    if (!product) return <div className="product-details-container"><p>Product not found.</p></div>;

    const getStatusClass = (status: string) => {
        if (status === 'In Stock') return 'status-in-stock';
        if (status === 'Low Stock') return 'status-low-stock';
        return 'status-out-of-stock';
    };

    return (
        <div className="product-details-container animate-in fade-in duration-500">
            <button className="back-button" onClick={() => navigate(-1)}>
                <ChevronLeft size={20} />
                Back to Catalogue
            </button>

            <div className="product-details-layout">
                {/* Left: Product Image */}
                <div className="product-image-container">
                    <ImageWithFallback
                        src={product.image || `https://images.unsplash.com/photo-1600000000000-0000?w=800&h=800&fit=crop`}
                        alt={product.name}
                    />
                </div>

                {/* Right: Product Info */}
                <div className="product-info">
                    <span className="category-badge">{product.category}</span>
                    <h1 className="product-name">{product.name}</h1>

                    <div className="product-id-sku">
                        <span>SKU: <strong>{product.sku || 'ISDN-B-001'}</strong></span>
                        <span>Product ID: <strong>{product.id || product._id?.slice(-8)}</strong></span>
                    </div>

                    <div className="price-stock">
                        <span className="detail-price">{formatPrice(product.price, currency)}</span>
                        <span className={`stock-status ${getStatusClass(product.status)}`}>
                            {product.status}
                        </span>
                    </div>

                    {product.promotion && (
                        <div className="promotion-badge-heavy">
                            <Tag size={18} />
                            <span>{product.promotion.badge} - {product.promotion.discountPercent}% Instant Savings</span>
                        </div>
                    )}

                    <h4 className="product-description-label">Description</h4>
                    <p className="product-description-text">
                        {product.description || "This premium ISDN terminal provides reliable, high-speed digital connectivity for mission-critical business communications. Engineered for durability and optimized for the IslandLink network, it ensures кристал-clear voice and stable data transmission."}
                    </p>

                    <div className="unit-size-info">
                        <p className="flex items-center gap-2">
                            <Package size={16} />
                            Unit Size: {product.unitSize || 'Standard Rackmount/Desktop'}
                        </p>
                    </div>

                    <div className="action-buttons">
                        {isAuthenticated ? (
                            <button
                                className="btn-add-to-cart"
                                onClick={() => onAddToCart(product)}
                                disabled={product.status === 'Critical'}
                            >
                                <ShoppingCart size={20} />
                                {product.status === 'Critical' ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        ) : (
                            <button className="btn-add-to-cart" onClick={() => navigate('/login')}>
                                Login to Order
                            </button>
                        )}
                        <button className="btn-back-details" onClick={() => navigate(-1)}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
