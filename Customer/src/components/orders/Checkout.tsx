import { useState, useEffect } from 'react';
import { MapPin, Calendar, CreditCard, Check, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../utils/stripe';
import { StripePayment } from './StripePayment';
import { paymentService } from '../../services/api';
import { formatPrice } from '../../utils/currencyUtils';
import type { Page, CartItem, User, Order } from '../../types';

interface CheckoutProps {
  cartItems: CartItem[];
  user: User | null;
  onPlaceOrder: (orderData: Omit<Order, 'orderId' | 'invoiceNumber' | 'date' | 'items' | 'subtotal' | 'tax' | 'total'>) => void;
  onNavigate: (page: Page) => void;
  currency: 'USD' | 'LKR';
}

export function Checkout({ cartItems, user, onPlaceOrder, onNavigate, currency }: CheckoutProps) {
  const [deliveryAddress, setDeliveryAddress] = useState('123 Island Street, Paradise Bay, Island 12345');
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [clientSecret, setClientSecret] = useState('');
  const [isInitializingStripe, setIsInitializingStripe] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.product?.price || 0);
    return sum + (price * item.quantity);
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const hasZeroPriceItems = cartItems.some(item => !item.product?.price || Number(item.product.price) <= 0);

  const initStripe = async () => {
    if (total <= 0) {
      setStripeError('Your cart total is $0.00. Please add items with valid prices to use card payments.');
      return;
    }

    try {
      setIsInitializingStripe(true);
      setStripeError('');

      console.log('Initializing Stripe:', { total, currency });

      // Stripe minimum amount check
      // Standard min is $0.50 USD.
      // valid amount for LKR ~ 150.00
      const minAmount = currency === 'LKR' ? 150 : 0.50;

      if (total < minAmount) {
        const displayTotal = formatPrice(total, currency);
        const displayMin = formatPrice(minAmount, currency);
        setStripeError(`Total amount (${displayTotal}) is below the minimum required for card payments (approx $0.50 USD). Please add more items or use another payment method.`);
        return;
      }

      const response = await paymentService.createPaymentIntent(total, currency || 'USD');
      setClientSecret(response.data.clientSecret);
    } catch (err: any) {
      console.error('Stripe Init Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initialize Stripe';
      setStripeError(`${errorMessage}. Please try again or use another payment method.`);
    } finally {
      setIsInitializingStripe(false);
    }
  };

  // Initialize estimated delivery date
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3); // 3 days estimation
    setDeliveryDate(date.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (paymentMethod === 'credit-card') {
      initStripe();
    } else {
      setStripeError('');
    }
  }, [paymentMethod, total]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!deliveryAddress || deliveryAddress.trim() === '') {
      toast.error('Please enter a delivery address');
      return;
    }

    if (!isAddressConfirmed) {
      toast.error('Please confirm your delivery address by checking the box');
      return;
    }

    if (!deliveryDate) {
      toast.error('Delivery date not set');
      return;
    }

    if (total <= 0) {
      toast.error('Cannot place an order with a zero total');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // All validations passed, place the order
    console.log('Placing order:', { deliveryAddress, deliveryDate, paymentMethod, total });

    onPlaceOrder({
      deliveryAddress,
      deliveryDate,
      paymentMethod,
      status: paymentMethod === 'cash-on-delivery' ? 'Pending' : 'Processing'
    });
  };

  // Get minimum delivery date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some products to your cart before checking out.</p>
          <button
            onClick={() => onNavigate('catalogue')}
            className="w-full py-3 bg-blue-600 text-black text-black text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
          <h1 className="text-3xl md:text-4xl text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium">
                  <Check className="w-5 h-5" />
                </div>
                <h2 className="text-xl text-gray-900">Customer Information</h2>
              </div>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-gray-900 font-medium">{user?.company || 'Island Retail Co.'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl text-gray-900">Delivery Address</h2>
              </div>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
              <div className="mt-3 flex items-start p-2 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center h-5">
                  <input
                    id="address-confirmation"
                    name="address-confirmation"
                    type="checkbox"
                    checked={isAddressConfirmed}
                    onChange={(e) => setIsAddressConfirmed(e.target.checked)}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded accent-green-600"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="address-confirmation" className="font-medium text-gray-900 select-none cursor-pointer">
                    Confirm Delivery Address
                  </label>
                  <p className="text-gray-600 text-xs">I confirm that the above delivery address is correct.</p>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Date */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-xl text-gray-900">Estimated Delivery Date</h2>
              </div>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium flex justify-between items-center">
                <span>
                  {deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Calculating...'}
                </span>
                <span className="text-sm text-green-600 font-normal bg-green-50 px-2 py-1 rounded">Auto-Scheduled</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your order is automatically scheduled for dispatch. Standard delivery time is 3 business days.
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 text-black rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl text-gray-900">Payment Method</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 text-black"
                  />
                  <div className="ml-3">
                    <p className="text-gray-900 font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 text-black"
                  />
                  <div className="ml-3">
                    <p className="text-gray-900 font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Transfer directly to our bank account</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash-on-delivery"
                    checked={paymentMethod === 'cash-on-delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 text-black"
                  />
                  <div className="ml-3">
                    <p className="text-gray-900 font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'credit-card' && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600 text-black" />
                    Secure Card Payment
                  </h3>

                  {isInitializingStripe ? (
                    <div className="flex flex-col items-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-600 text-black animate-spin mb-3" />
                      <p className="text-sm text-gray-500 font-medium">Initializing secure gateway...</p>
                    </div>
                  ) : stripeError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-700 font-medium">{stripeError}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={initStripe}
                          className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setPaymentMethod('cash-on-delivery')}
                          className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50"
                        >
                          Use Cash on Delivery
                        </button>
                      </div>
                    </div>
                  ) : clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                      <StripePayment
                        amount={total}
                        currency={currency || 'USD'}
                        onSuccess={(paymentIntentId) => onPlaceOrder({
                          deliveryAddress,
                          deliveryDate,
                          paymentMethod,
                          status: 'Paid',
                          paymentIntentId
                        })}
                        onError={(msg) => setStripeError(msg)}
                      />
                    </Elements>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl text-gray-900 font-medium mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product?.id || Math.random()} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-gray-900">{item.product?.name || 'Item'}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-gray-900 font-bold">
                      {formatPrice((item.product?.price || 0) * item.quantity, currency || 'USD')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency || 'USD')}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax, currency || 'USD')}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total, currency || 'USD')}</span>
                  </div>
                </div>
              </div>

              {paymentMethod !== 'credit-card' && (
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-medium transition-colors mb-3"
                >
                  Confirm Order
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('catalogue')}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
