export interface Product {
    id: string;
    _id?: string;
    name: string;
    price: number;
    category: string;
    status: 'In Stock' | 'Low Stock' | 'Critical';
    image: string;
    description: string;
    sku: string;
    unitSize?: string;
    promotion?: {
        badge: string;
        discountPercent: number;
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    company: string;
    role: 'customer' | 'admin' | 'sales_manager';
    phone?: string;
    address?: string;
    image?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export type Page = 'home' | 'about' | 'contact' | 'catalogue' | 'login' | 'register' | 'dashboard' | 'profile' | 'cart' | 'checkout' | 'order-confirmation' | 'orders' | 'track' | 'invoices' | 'promotions' | 'product-details';

export interface Order {
    orderId: string;
    invoiceNumber: string;
    date: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    customer?: string;
    totalAmount?: number;
    orderDate?: string;
    status: 'Pending' | 'Approved' | 'Processing' | 'Confirmed' | 'Ready for Delivery' | 'ReadyForDispatch' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled' | 'Paid';
    deliveryAddress: string;
    deliveryDate: string;
    paymentMethod: string;
    paymentIntentId?: string;
}
