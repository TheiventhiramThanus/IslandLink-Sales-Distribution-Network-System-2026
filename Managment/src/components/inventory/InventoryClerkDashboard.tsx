import { useState, useEffect } from 'react';
import { orderService, productService } from '../../services/api';
import { Layout } from '../Layout';
import { NavItem } from '../NavItem';
import { StatCard } from '../StatCard';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  FileText,
  TrendingDown,
  ArrowLeftRight,
  ClipboardCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface InventoryClerkDashboardProps {
  onLogout: () => void;
}

export function InventoryClerkDashboard({ onLogout }: InventoryClerkDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        orderService.getAll(),
        productService.getAll()
      ]);
      setOrders(ordersRes.data as any[]);
      setProducts(productsRes.data as any[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to sync inventory data');
    } finally {
      setLoading(false);
    }
  };


  const sidebar = (
    <div className="space-y-1">
      <NavItem
        icon={LayoutDashboard}
        label="Dashboard"
        active={activeView === 'dashboard'}
        onClick={() => setActiveView('dashboard')}
      />
      <NavItem
        icon={FileText}
        label="Assigned Orders"
        active={activeView === 'orders'}
        onClick={() => setActiveView('orders')}
        badge={orders.filter(o => o.status === 'Pending').length}
      />
      <NavItem
        icon={Package}
        label="Stock Management"
        active={activeView === 'stock'}
        onClick={() => setActiveView('stock')}
      />
      <NavItem
        icon={TrendingDown}
        label="Goods Received"
        active={activeView === 'received'}
        onClick={() => setActiveView('received')}
      />
      <NavItem
        icon={AlertTriangle}
        label="Returns & Damages"
        active={activeView === 'returns'}
        onClick={() => setActiveView('returns')}
      />
      <NavItem
        icon={ClipboardCheck}
        label="Stock Audit"
        active={activeView === 'audit'}
        onClick={() => setActiveView('audit')}
      />
      <NavItem
        icon={ArrowLeftRight}
        label="Inter-RDC Transfer"
        active={activeView === 'transfer'}
        onClick={() => setActiveView('transfer')}
      />
    </div>
  );

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <Layout
      sidebar={sidebar}
      userRole="RDC Inventory Clerk"
      userName="Sarah Johnson"
      onLogout={onLogout}
    >
      {activeView === 'dashboard' && <InventoryDashboardView orders={orders} products={products} />}
      {activeView === 'orders' && <AssignedOrdersView orders={orders} onRefresh={() => fetchProducts()} />}
      {activeView === 'stock' && <StockManagementView products={products} onRefresh={() => fetchProducts()} />}
      {activeView === 'received' && <GoodsReceivedView products={products} onReceived={() => fetchProducts()} />}
      {activeView === 'returns' && <ReturnsView products={products} />}
      {activeView === 'audit' && <AuditView />}
      {activeView === 'transfer' && <TransferView products={products} />}
    </Layout>
  );
}

function InventoryDashboardView({ orders, products }: { orders: any[], products: any[] }) {
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const lowStockCount = products.filter(p => (p.available || 0) < 50).length;
  const stockValue = products.reduce((acc, p) => acc + (p.stock || 0) * (p.price || 0), 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">RDC Inventory Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Stock Items"
          value={totalStock.toLocaleString()}
          icon={Package}
          color="bg-blue-600"
        />
        <StatCard
          title="Orders to Process"
          value={pendingOrders.toString()}
          icon={FileText}
          color="bg-yellow-500"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          icon={AlertTriangle}
          color="bg-red-500"
        />
        <StatCard
          title="Stock Value"
          value={`$${(stockValue / 1).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={TrendingDown}
          color="bg-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {products.filter(p => (p.available || 0) < 50).slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-600">Current: {item.available} | SKU: {item.sku}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-200 text-red-800">
                  Low
                </span>
              </div>
            ))}
            {products.filter(p => (p.available || 0) < 50).length === 0 && (
              <p className="text-sm text-gray-500 italic">No low stock alerts</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {[
              { action: 'Stock Level Sync', item: 'System automatic update', time: 'Just now' },
              { action: 'Dashboard Loaded', item: `Fetched ${products.length} products`, time: '1 minute ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.item}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignedOrdersView({ orders, onRefresh }: { orders: any[], onRefresh: () => void }) {
  const handleProcess = async (id: string) => {
    try {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      const clerkId = user?.id || user?._id;

      if (!clerkId) {
        toast.error('Session expired. Please login again.');
        return;
      }

      await orderService.sendToLogistics(id, clerkId);
      toast.success('Order accepted and sent to Logistics Dispatch Queue');
      onRefresh();
    } catch (error) {
      console.error('Failed to process order:', error);
      toast.error('Failed to accept order');
    }
  };


  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned Orders</h2>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.priority === 'High'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleProcess(order._id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-1 rounded-lg"
                      >
                        Accept to Dispatch
                      </button>
                    )}
                    {(order.status === 'ReadyForDispatch') && (
                      <span className="text-gray-400 text-xs italic">Sent to Logistics</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import './StockManagementView.css';

// ... (other imports remain, ensuring we don't duplicate or delete needed ones)

function StockManagementView({ products, onRefresh }: { products: any[], onRefresh: () => void }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    reserved: 0,
    rdc: 'Colombo RDC', // Keep existing for compatibility
    center: 'Central', // New field
    location: 'WH-A1',
    price: 0,
    category: 'General',
    description: '',
    image: '',
    size: '',
    color: '',
    status: 'In Stock'
  });

  // Handle Edit Selection (from Table or List)
  const handleSelectProduct = (product: any) => {
    const id = product._id || product.id;
    console.log('Selected product for edit:', id, product); // Debug log
    if (!id) {
      toast.error('Cannot edit product: Missing ID');
      return;
    }
    setSelectedProductId(id);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      stock: product.stock || 0,
      reserved: product.reserved || 0,
      rdc: product.rdc || 'Colombo RDC',
      center: product.center || 'Central',
      location: product.location || 'WH-A1',
      price: product.price || 0,
      category: product.category || 'General',
      description: product.description || '',
      image: product.image || '',
      size: product.size || '',
      color: product.color || '',
      status: product.status || 'In Stock'
    });
    setImagePreview(product.image || '');

    // Smooth scroll to form on mobile
    if (window.innerWidth < 1024) {
      document.querySelector('.stock-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset Form for "New Product"
  const handleNewProduct = () => {
    setSelectedProductId(null);
    setFormData({
      name: '',
      sku: '',
      stock: 0,
      reserved: 0,
      rdc: 'Colombo RDC',
      center: 'Central', // Reset new field
      location: 'WH-A1',
      price: 0,
      category: 'General',
      description: '',
      image: '',
      size: '',
      color: '',
      status: 'In Stock'
    });
    setImagePreview('');
  };

  // Handle Submit (Create or Update)
  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Product name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure 'center' is included in the payload
      const payload = { ...formData, image: formData.image };
      console.log('Submitting payload:', payload, 'ID:', selectedProductId);

      if (selectedProductId) {
        await productService.update(selectedProductId, payload);
        toast.success('Product updated successfully');
      } else {
        await productService.create(payload);
        toast.success('Product added successfully');
        handleNewProduct(); // Reset after add
      }
      onRefresh();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      toast.error(error?.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      if (selectedProductId === id) handleNewProduct();
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simple read for now, sticking to logic
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="stock-management-container">
      {/* Header */}
      <div className="stock-header">
        <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
        <button className="btn-add-product" onClick={handleNewProduct}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="stock-grid">

        {/* Left Column: Product List */}
        <div className="stock-sidebar-list">
          <div className="sidebar-header">PRODUCT LIST</div>
          <div className="space-y-1">
            {products.map(p => {
              const productId = p._id || p.id;
              return (
                <div
                  key={productId}
                  onClick={() => handleSelectProduct(p)}
                  className={`product-list-item ${selectedProductId === productId ? 'active' : ''}`}
                >
                  <div className="product-name">{p.name || 'Unnamed Product'}</div>
                  <div className="text-xs text-gray-500">{p.sku || 'No SKU'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Form */}
        <div className="stock-form-section">
          <h3 className="stock-form-title">{selectedProductId ? 'Edit Product' : 'Add New Product'}</h3>

          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              className="form-input"
              placeholder="Input product name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">SKU</label>
              <input
                className="form-input"
                placeholder="Input SKU"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option>General</option>
                <option>Beverages</option>
                <option>Food</option>
                <option>Electronics</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '16px' }}>
            <div className="form-col">
              <label className="form-label">Center <span className="text-red-500">*</span></label>
              <select
                className="form-select"
                value={formData.center}
                onChange={e => setFormData({ ...formData, center: e.target.value })}
              >
                <option value="Central">Central</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Price (LKR)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '16px' }}>
            <div className="form-col">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Product Description</label>
            <textarea
              className="form-input"
              style={{ height: 'auto', minHeight: '80px', padding: '12px' }}
              placeholder="Enter product description..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Image Product</label>
            <div className="flex gap-4 items-center">
              <label className="upload-box">
                <Plus className="text-gray-400" />
                <span className="upload-text">Upload Photo</span>
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </label>
              {imagePreview && (
                <div className="w-24 h-24 shrink-0 rounded-lg border border-gray-200 overflow-hidden relative group">
                  <img src={imagePreview} className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setImagePreview(''); setFormData({ ...formData, image: '' }); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={12} className="rotate-45" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>

        {/* Right Column: Mini Table */}
        <div className="stock-table-section">
          <div className="table-header-row">
            <div className="table-header-cell" style={{ flex: 0.5 }}>Available</div>
            <div className="table-header-cell">Status</div>
            <div className="table-header-cell" style={{ textAlign: 'right' }}>Actions</div>
          </div>

          <div className="table-body custom-scrollbar">
            {products.map(p => {
              const productId = p._id || p.id;
              return (
                <div key={productId} className="table-row">
                  <div className="table-cell" data-label="Available" style={{ flex: 0.5 }}>
                    <span className="font-bold text-gray-900">{p.available || p.stock}</span>
                  </div>
                  <div className="table-cell" data-label="Status">
                    <span className={`status-badge ${p.status === 'In Stock' ? 'status-in-stock' :
                      p.status === 'Low Stock' ? 'status-low' : 'status-critical'
                      }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="table-cell actions-cell" data-label="Actions">
                    <button className="btn-action btn-edit" onClick={() => handleSelectProduct(p)}>Edit</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(productId, p.name)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}


function GoodsReceivedView({ products, onReceived }: { products: any[], onReceived: () => void }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleReceive = async () => {
    if (!selectedProduct || !quantity) return;
    try {
      await productService.updateStock(selectedProduct, parseInt(quantity));
      toast.success('Stock updated successfully');
      onReceived();
      setQuantity('');
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Goods Received Entry</h2>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-3xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => { setSelectedProduct(''); setQuantity(''); }}
            >
              Clear
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleReceive}
            >
              Add to Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnsView({ products }: { products: any[] }) {
  const [formData, setFormData] = useState({
    type: 'Customer Return',
    ref: '',
    product: '',
    qty: '',
    reason: ''
  });

  const handleSubmit = () => {
    if (!formData.product || !formData.qty) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Return request submitted for approval');
    setFormData({ type: 'Customer Return', ref: '', product: '', qty: '', reason: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Returns & Damaged Goods</h2>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-3xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Customer Return</option>
                <option>Damaged in Transit</option>
                <option>Defective Product</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Reference</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ORD-2026-XXX"
                value={formData.ref}
                onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. Broken packaging"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              onClick={() => setFormData({ type: 'Customer Return', ref: '', product: '', qty: '', reason: '' })}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-sm"
              onClick={handleSubmit}
            >
              Submit Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditView() {
  const auditLogs = [
    { date: '2026-01-18', item: 'Electric Motor A1', system: 450, physical: 450, variance: 0, status: 'Verified' },
    { date: '2026-01-17', item: 'Control Panel X3', system: 120, physical: 118, variance: -2, status: 'Adjusted' },
    { date: '2026-01-16', item: 'Wiring Kit 5m', system: 890, physical: 890, variance: 0, status: 'Verified' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Physical Stock Audit</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-all shadow-sm">
          Start New Audit Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Audit Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">System Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Physical Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Variance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditLogs.map((log, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{log.date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{log.item}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.system}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-bold">{log.physical}</td>
                <td className={`px-6 py-4 text-sm font-bold ${log.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {log.variance}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${log.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransferView({ products }: { products: any[] }) {
  const [formData, setFormData] = useState({
    toRdc: '',
    productId: '',
    qty: '',
    reason: ''
  });

  const handleTransfer = () => {
    if (!formData.toRdc || !formData.productId || !formData.qty) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success(`Transfer of ${formData.qty} units initiated successfully`);
    setFormData({ toRdc: '', productId: '', qty: '', reason: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inter-RDC Stock Transfer</h2>
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 max-w-3xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Source RDC</label>
              <p className="text-sm font-bold text-blue-700">RDC North (Current)</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Destination RDC</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={formData.toRdc}
                onChange={(e) => setFormData({ ...formData, toRdc: e.target.value })}
              >
                <option value="">Select destination...</option>
                <option>RDC South Logistics</option>
                <option>RDC East Distribution</option>
                <option>RDC West Hub</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Product to Transfer</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} (Available: {p.available})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Transfer Priority / Reason</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                placeholder="Targeting stock out in South"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              onClick={() => setFormData({ toRdc: '', productId: '', qty: '', reason: '' })}
            >
              Clear
            </button>
            <button
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md transition-all active:scale-95"
              onClick={handleTransfer}
            >
              Initiate Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
