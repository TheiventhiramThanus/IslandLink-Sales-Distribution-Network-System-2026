import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/shop/Hero';
import { ProductCatalogue } from './components/shop/ProductCatalogue';
import { Dashboard } from './components/dashboard/Dashboard';
import { MyOrders } from './components/orders/MyOrders';
import { TrackDelivery } from './components/orders/TrackDelivery';
import { Invoices } from './components/orders/Invoices';
import { Profile } from './components/profile/Profile';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { About } from './components/pages/About';
import { Contact } from './components/pages/Contact';
import { Cart } from './components/shop/Cart';
import { Checkout } from './components/orders/Checkout';
import { OrderConfirmation } from './components/orders/OrderConfirmation';
import { Promotions } from './components/shop/Promotions';
import { ProductDetails } from './components/shop/ProductDetails';
import { authService, productService, orderService } from './services/api';
import { emailJSService } from './services/emailJSService';
import type { User, Product, CartItem, Order } from './types';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('USD');

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'LKR' : 'USD');
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    const fetchStoredUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }

      // Load stored cart
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          // Validate cart items to prevent crashes
          if (Array.isArray(parsedCart)) {
            const validItems = parsedCart.filter(item => item && item.product && typeof item.product.price === 'number');
            setCartItems(validItems);
          }
        } catch (e) {
          localStorage.removeItem('cart');
        }
      }
    };
    fetchStoredUser();
  }, []);

  // Persist cart changes
  useEffect(() => {
    // We can remove the check for !isLoading since we want to persist cart always or just when it changes
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await orderService.getByUser(user.id);
          // Only log if there are actual orders
          if (response.data && response.data.length > 0) {
            console.log('Real-time sync successful');
          }
        } catch (e: any) {
          // Only handle critical errors, ignore 400/404
          if (e.response && e.response.status === 401) {
            console.error('Session invalid: Unauthorized');
            handleLogout();
            toast.error('Session expired. Please login again.');
          }
          // Silently ignore other errors to prevent console spam
        }
      }, 30000); // Poll every 30 seconds
      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, user]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await authService.login(email, password);
      const userData = res.data.user;
      const newUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        company: userData.company || 'Island Retail Co.',
        role: 'customer'
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', 'demo-token'); // Placeholder for interceptor

      setIsAuthenticated(true);
      navigate('/dashboard');
      toast.success('Login successful!');

      // Send login notification
      emailJSService.sendLoginNotification(newUser.name, newUser.email).then(res => {
        if (!res.success) console.error('Failed to send login email');
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (name: string, email: string, company: string, password: string) => {
    try {
      // Use the password provided by the user during registration
      const res = await authService.register({ name, email, company, password });
      const userData = res.data.user;
      const newUser: User = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        company: userData.company || company,
        role: 'customer'
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', 'demo-token');

      setIsAuthenticated(true);
      navigate('/dashboard');
      toast.success('Registration successful!');

      // Send welcome email
      emailJSService.sendWelcomeEmail(newUser.name, newUser.email).then(res => {
        if (!res.success) console.error('Failed to send welcome email');
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    navigate('/');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success('Product quantity updated in cart!');
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
      toast.success('Product added to cart!', {
        description: product.name,
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart'),
        },
      });
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
    toast.success('Product removed from cart');
  };

  const handlePlaceOrder = async (orderData: Omit<Order, 'orderId' | 'invoiceNumber' | 'date' | 'items' | 'subtotal' | 'tax' | 'total'>) => {
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax;

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

      const order: Order = {
        orderId: orderId,
        invoiceNumber: invoiceNumber,
        date: new Date().toLocaleDateString(),
        items: cartItems,
        subtotal,
        tax,
        total,
        ...orderData
      };

      console.log('Creating order:', {
        items: cartItems.length,
        total,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status
      });

      const res = await orderService.create({
        items: cartItems.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: total,
        address: orderData.deliveryAddress,
        customer: user?.name || 'Guest',
        userId: user?.id,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        paymentIntentId: (orderData as any).paymentIntentId
      });

      console.log('Order created successfully:', res.data);

      setCurrentOrder({
        ...order,
        orderId: res.data.orderId || order.orderId
      });
      setCartItems([]);

      toast.success('Order placed successfully!');
      navigate('/order-confirmation');

      toast.success('Order placed successfully!');
      navigate('/order-confirmation');

      // Send order confirmation email
      const orderForEmail = {
        ...order,
        orderId: res.data.orderId || order.orderId,
        currency: currency // Pass correct currency
      };

      if (user?.email) {
        emailJSService.sendOrderConfirmation(orderForEmail, user.email).then(res => {
          if (res.success) {
            toast.success('Confirmation email sent');
          } else {
            console.error('Failed to send confirmation email', res);
          }
        });
      }

      console.log('Order processed:', orderForEmail);
      console.log('Order details:', order);
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" richColors />
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        currentPage={location.pathname === '/' ? 'home' : location.pathname.slice(1) as any}
        onNavigate={(path) => navigate(path === 'home' ? '/' : `/${path}`)}
        onLogout={handleLogout}
        cartItemCount={cartItems.length}
        currency={currency}
        onToggleCurrency={toggleCurrency}
      />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero isAuthenticated={isAuthenticated} onNavigate={(page: any) => navigate(page === 'home' ? '/' : `/${page}`)} />
              <ProductCatalogue
                isAuthenticated={isAuthenticated}
                onNavigate={(page: any) => navigate(page === 'home' ? '/' : `/${page}`)}
                onAddToCart={handleAddToCart}
                cartItemCount={cartItems.length}
                currency={currency}
              />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/catalogue" element={
            <ProductCatalogue
              isAuthenticated={isAuthenticated}
              onNavigate={(page: any) => navigate(page === 'home' ? '/' : `/${page}`)}
              onAddToCart={handleAddToCart}
              cartItemCount={cartItems.length}
              fullPage
              currency={currency}
            />
          } />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/product/:id" element={
            <ProductDetails
              currency={currency}
              onAddToCart={handleAddToCart}
              isAuthenticated={isAuthenticated}
            />
          } />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} onNavigate={(path: any) => navigate(`/${path}`)} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register onRegister={handleRegister} onNavigate={(path: any) => navigate(`/${path}`)} />
          } />

          <Route path="/dashboard" element={
            isAuthenticated ? (
              <Dashboard user={user} onNavigate={(path: any) => navigate(`/${path}`)} currency={currency} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/orders" element={
            isAuthenticated ? (
              <MyOrders user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/track" element={
            isAuthenticated ? (
              <TrackDelivery user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/invoices" element={
            isAuthenticated ? (
              <Invoices user={user} currency={currency} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/profile" element={
            isAuthenticated ? (
              <Profile user={user} onUpdateUser={handleUpdateUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/cart" element={
            <Cart
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              onNavigate={(path: any) => navigate(`/${path}`)}
              currency={currency}
            />
          } />
          <Route path="/checkout" element={
            isAuthenticated ? (
              <Checkout
                cartItems={cartItems}
                user={user}
                onPlaceOrder={handlePlaceOrder}
                onNavigate={(path: any) => navigate(`/${path}`)}
                currency={currency}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/order-confirmation" element={
            <OrderConfirmation
              order={currentOrder}
              user={user}
              onNavigate={(path: any) => navigate(`/${path}`)}
              currency={currency}
            />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 ISDN - IslandLink Sales Distribution Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
