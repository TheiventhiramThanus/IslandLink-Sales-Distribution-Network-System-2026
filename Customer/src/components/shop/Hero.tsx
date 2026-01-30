import { ShoppingCart, TruckIcon, Package } from 'lucide-react';
import type { Page } from '../../types';

interface HeroProps {
  isAuthenticated: boolean;
  onNavigate: (page: Page) => void;
}

export function Hero({ isAuthenticated, onNavigate }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      {/* Background Removed */}

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl mb-6 text-gray-900 font-bold">
            Welcome to <span className="text-blue-600 text-black">ISDN</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
            IslandLink Sales Distribution Network
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your trusted partner for seamless product distribution across the islands.
            Access our extensive catalogue, place orders, and track deliveries all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="px-8 py-4 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-lg"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => onNavigate('orders')}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-600 text-black border-2 border-blue-600 text-black rounded-lg hover:bg-white font-bold transition-all"
                >
                  View My Orders
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-4 bg-blue-600 text-black text-black text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-lg"
                >
                  Get Started
                </button>
                <button
                  onClick={() => onNavigate('catalogue')}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-600 text-black border-2 border-blue-600 text-black rounded-lg hover:bg-white font-bold transition-all"
                >
                  View Catalogue
                </button>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-7 h-7 text-blue-600 text-black" />
              </div>
              <h3 className="text-gray-900 mb-2 font-bold">Easy Ordering</h3>
              <p className="text-gray-600 text-sm">Browse and order from our extensive product catalogue with just a few clicks</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-7 h-7 text-blue-600 text-black" />
              </div>
              <h3 className="text-gray-900 mb-2 font-bold">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">Track your deliveries in real-time from warehouse to your doorstep</p>
            </div>
            <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-blue-600 text-black" />
              </div>
              <h3 className="text-gray-900 mb-2 font-bold">Wide Selection</h3>
              <p className="text-gray-600 text-sm">Access to thousands of products from trusted suppliers across the region</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
