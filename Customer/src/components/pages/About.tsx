import { Target, Users, Award, TruckIcon } from 'lucide-react';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-gray-900 mb-6">About ISDN</h1>
          <p className="text-xl text-gray-600 mb-4">
            IslandLink Sales Distribution Network
          </p>
          <p className="text-lg text-gray-600">
            Your trusted partner for reliable product distribution across the islands.
            We connect businesses with quality products and efficient delivery services.
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
            <Target className="w-12 h-12 text-blue-600 text-black mb-4" />
            <h2 className="text-2xl text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To provide seamless, reliable distribution services that connect island businesses
              with the products they need, when they need them. We're committed to building
              lasting partnerships and supporting local commerce.
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
            <Award className="w-12 h-12 text-blue-600 text-black mb-4" />
            <h2 className="text-2xl text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-700">
              Integrity, reliability, and customer service are at the heart of everything we do.
              We believe in transparent pricing, timely deliveries, and building trust through
              consistent, quality service.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl text-gray-900 text-center mb-12">Why Choose ISDN?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-blue-600 text-black" />
              </div>
              <h3 className="text-xl text-gray-900 mb-3">Reliable Delivery</h3>
              <p className="text-gray-600">
                On-time delivery guaranteed with real-time tracking for all shipments
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600 text-black" />
              </div>
              <h3 className="text-xl text-gray-900 mb-3">Dedicated Support</h3>
              <p className="text-gray-600">
                Our team is always ready to assist you with orders and deliveries
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600 text-black" />
              </div>
              <h3 className="text-xl text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                All products are sourced from trusted suppliers and carefully handled
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 text-black to-blue-700 rounded-lg p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl mb-2">1000+</p>
              <p className="text-blue-100">Products</p>
            </div>
            <div>
              <p className="text-4xl mb-2">500+</p>
              <p className="text-blue-100">Active Clients</p>
            </div>
            <div>
              <p className="text-4xl mb-2">50+</p>
              <p className="text-blue-100">Islands Served</p>
            </div>
            <div>
              <p className="text-4xl mb-2">99%</p>
              <p className="text-blue-100">On-Time Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
