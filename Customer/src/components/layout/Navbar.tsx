import { Menu, X, User, ChevronDown, ShoppingCart, Globe } from 'lucide-react';
import { useState } from 'react';
import type { Page, User as UserType } from '../../types';

interface NavbarProps {
  isAuthenticated: boolean;
  user: UserType | null;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  cartItemCount: number;
  currency: 'USD' | 'LKR';
  onToggleCurrency: () => void;
}

export function Navbar({ isAuthenticated, user, currentPage, onNavigate, onLogout, cartItemCount, currency, onToggleCurrency }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const publicMenuItems = [
    { label: 'Home', shortLabel: 'Home', page: 'home' as Page },
    { label: 'About ISDN', shortLabel: 'About', page: 'about' as Page },
    { label: 'Product Catalogue', shortLabel: 'Product', page: 'catalogue' as Page },
    { label: 'View Promotions', shortLabel: 'Promotion', page: 'promotions' as Page },
    { label: 'Contact Us', shortLabel: 'Contact', page: 'contact' as Page },
  ];

  const authenticatedMenuItems = [
    { label: 'Dashboard', shortLabel: 'Dash', page: 'dashboard' as Page },
    { label: 'Product Catalogue', shortLabel: 'Product', page: 'catalogue' as Page },
    { label: 'View Promotions', shortLabel: 'Promo', page: 'promotions' as Page },
    { label: 'My Orders', shortLabel: 'Orders', page: 'orders' as Page },
    { label: 'Track Delivery', shortLabel: 'Track', page: 'track' as Page },
    { label: 'Invoices & Payments', shortLabel: 'Invoices', page: 'invoices' as Page },
  ];

  const menuItems = (isAuthenticated ? authenticatedMenuItems : publicMenuItems) as any[];

  return (
    <nav className="bg-white border-b-4 border-[#008000] text-black shadow-sm sticky top-0 z-[1000]" style={{ overflowX: 'visible' }}>
      <div className="container mx-auto px-4" style={{ overflowX: 'visible' }}>
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <button
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
            className="flex items-center flex-shrink-0"
            aria-label="Home"
          >
            <img
              src="/isdn_logo_green.png"
              alt="IslandLink ISDN"
              className="h-[30px] md:h-[38px] w-auto"
              style={{ objectFit: 'contain', display: 'block' }}
            />
          </button>

          {/* Desktop Menu - Floating Tab System */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-2 lg:gap-4 px-2">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center justify-center rounded-full font-bold transition-all duration-300 active:scale-95 px-3 lg:px-6 h-[42px] text-[12px] lg:text-[13px] whitespace-nowrap
                  ${currentPage === item.page
                    ? 'text-white shadow-lg shadow-green-100'
                    : 'text-gray-500 hover:text-[#008000] hover:bg-green-50'
                  }`}
                style={currentPage === item.page
                  ? { backgroundColor: '#008000' }
                  : {}
                }
              >
                <span className="hidden lg:inline">{item.label}</span>
                <span className="inline lg:hidden">{item.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Currency Toggle & Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Currency Toggle */}
            <button
              onClick={onToggleCurrency}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border-2 border-green-100 hover:border-green-400 transition-all font-bold text-sm bg-green-50/50"
              style={{ color: '#008000' }}
            >
              <span style={{ color: currency === 'USD' ? '#008000' : '#9ca3af' }}>USD</span>
              <span className="text-gray-300 mx-1">|</span>
              <span style={{ color: currency === 'LKR' ? '#008000' : '#9ca3af' }}>LKR</span>
            </button>
            {/* Cart Icon */}
            {isAuthenticated && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-2 text-gray-700 hover:bg-green-50 hover:text-[#008000] rounded-full transition-all active:scale-95"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: '#008000' }}
                  >
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-50 text-[#008000] border-2 border-green-100 hover:bg-green-100 transition-all active:scale-95 shadow-sm"
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">{user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 transition-colors"
                      style={{ color: '#008000' }}
                    >
                      Profile
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={() => {
                        onLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-2.5 font-bold transition-all rounded-full active:scale-95 border-2 border-transparent hover:bg-green-50 min-w-[100px]"
                  style={{ color: '#008000' }}
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-2.5 text-white rounded-full font-bold shadow-md shadow-green-100 transition-all active:scale-95 border-2 min-w-[120px]"
                  style={{ backgroundColor: '#008000', borderColor: '#008000' }}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div >

        {/* Mobile Menu */}
        {
          isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              {/* Mobile Currency Toggle */}
              <div className="px-4 mb-4">
                <button
                  onClick={onToggleCurrency}
                  className="w-full flex justify-between items-center px-4 py-3 rounded-lg border-2 border-green-50 bg-green-50/20"
                >
                  <span className="text-sm font-medium text-gray-600">Switch Currency</span>
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <span className={currency === 'USD' ? 'text-[#008000]' : 'text-gray-400'}>USD</span>
                    <span className="text-gray-300">|</span>
                    <span className={currency === 'LKR' ? 'text-[#008000]' : 'text-gray-400'}>LKR</span>
                  </div>
                </button>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-6 py-3.5 rounded-full font-bold transition-all duration-200 mb-3 active:scale-95 shadow-sm border-2 ${currentPage === item.page
                    ? 'text-white'
                    : 'bg-green-50'
                    }`}
                  style={currentPage === item.page
                    ? { backgroundColor: '#008000', borderColor: '#008000' }
                    : { color: '#008000', borderColor: '#f0fdf4' }
                  }
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated ? (
                <>
                  <hr className="my-3 border-gray-200" />
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 text-gray-700 hover:bg-green-50 hover:text-[#008000] rounded-full transition-all active:scale-95 mb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-[#008000]" />
                      <span className="font-semibold">{user?.name}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-95 mb-2 border-2 border-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-3 border-gray-200" />
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 text-[#008000] font-bold hover:bg-green-50 rounded-full transition-all active:scale-95 mb-2 border-2 border-green-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 bg-[#008000] text-white font-bold rounded-full transition-all active:scale-95 shadow-md shadow-green-100"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          )
        }
      </div >
    </nav >
  );
}
