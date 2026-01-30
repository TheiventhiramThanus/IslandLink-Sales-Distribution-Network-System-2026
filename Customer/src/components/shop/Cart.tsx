import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Page, CartItem } from '../../types';
import { ImageWithFallback } from '../layout/figma/ImageWithFallback';
import { formatPrice } from '../../utils/currencyUtils';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (page: Page) => void;
  currency: 'USD' | 'LKR';
}

export function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onNavigate, currency }: CartProps) {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding products to your cart to place an order
          </p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="px-8 py-3 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/photo-1600000000000-0000?w=200&h=200&fit=crop`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg text-gray-900 font-medium mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">{item.product.category}</p>
                        <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium text-gray-900 w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-blue-600 text-black text-black hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xl text-gray-900 font-bold">
                          {formatPrice(item.product.price * item.quantity, currency)}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">{formatPrice(item.product.price, currency)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl text-gray-900 font-medium mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax, currency)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total, currency)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('checkout')}
                className="w-full py-3 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center space-x-2 mb-3"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate('catalogue')}
                className="w-full py-3 bg-white border-2 border-blue-600 text-black text-blue-600 text-black rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                Continue Shopping
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900">
                  <strong>Free delivery</strong> on orders over {formatPrice(100, currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
