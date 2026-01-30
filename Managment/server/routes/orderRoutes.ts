import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import { emailService } from '../services/emailService';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
});

const router = express.Router();

// @desc    Get all orders
// @route   GET /api/orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({}).populate('salesRep', 'name').populate('items.product', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get orders by User ID
// @route   GET /api/orders/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        // Search by userId directly for reliable results
        const orders = await Order.find({ userId: req.params.userId }).populate('items.product', 'name');

        // If no orders found by userId, fallback to name search for legacy orders
        if (orders.length === 0) {
            const User = mongoose.model('User');
            const user = await User.findById(req.params.userId);
            if (user) {
                const legacyOrders = await Order.find({ customer: user.name }).populate('items.product', 'name');
                return res.json(legacyOrders);
            }
        }

        res.json(orders);
    } catch (error) {
        console.error('Fetch orders error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create new order
// @route   POST /api/orders
router.post('/', async (req, res) => {
    try {
        // Auto-generate orderId
        const orderCount = await Order.countDocuments();
        const orderId = `ORD-${Date.now()}-${orderCount + 1}`;

        // Build order data with defaults
        const orderData = {
            ...req.body,
            orderId,
            // If no salesRep provided, we'll skip it (make it optional in validation)
            orderDate: new Date()
        };

        // Handle items - filter out invalid products
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items = orderData.items.filter((item: any) =>
                item.product && item.quantity > 0
            ).map((item: any) => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price || 0
            }));
        }

        const order = new Order(orderData);
        const createdOrder = await order.save();

        // Fetch user to get email reliably
        let user = null;
        if (createdOrder.userId) {
            user = await User.findById(createdOrder.userId);
        } else {
            // Fallback to name search for compatibility
            user = await User.findOne({ name: createdOrder.customer });
        }

        if (user && user.email) {
            // Populate product names for the email
            const populatedOrder = await Order.findById(createdOrder._id).populate('items.product', 'name');
            await emailService.sendOrderConfirmationEmail({ name: user.name, email: user.email }, populatedOrder);
        }

        res.status(201).json(createdOrder);
    } catch (error: any) {
        console.error('Order creation error:', error.message);
        res.status(400).json({ message: error.message || 'Invalid order data' });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();

            // Send status update email
            let user = null;
            if (updatedOrder.userId) {
                user = await User.findById(updatedOrder.userId);
            } else {
                user = await User.findOne({ name: updatedOrder.customer });
            }

            if (user && user.email) {
                await emailService.sendOrderStatusUpdateEmail({ name: user.name, email: user.email }, updatedOrder);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid status update' });
    }
});



// @desc    Cancel order and refund if applicable
// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if cancellable
        if (['Delivered', 'In Transit', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ message: `Cannot cancel order in ${order.status} status` });
        }

        let refundAmount = 0;

        // Process Refund if Paid
        if (order.status === 'Paid' && order.paymentIntentId) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: order.paymentIntentId,
                });
                refundAmount = refund.amount / 100; // Convert cents to dollars
                console.log(`Refund processed: ${refund.id}`);
            } catch (stripeError: any) {
                console.error('Stripe refund failed:', stripeError);
                return res.status(500).json({ message: 'Refund failed: ' + stripeError.message });
            }
        }

        order.status = 'Cancelled';
        const updatedOrder = await order.save();

        // Send Email
        let user = null;
        if (updatedOrder.userId) {
            user = await User.findById(updatedOrder.userId);
        } else {
            user = await User.findOne({ name: updatedOrder.customer });
        }

        if (user && user.email) {
            await emailService.sendOrderCancellationEmail({ name: user.name, email: user.email }, updatedOrder, refundAmount);
        }

        res.json({ message: 'Order cancelled successfully', refundAmount, order: updatedOrder });
    } catch (error: any) {
        console.error('Cancellation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Assign driver to order
// @route   PUT /api/orders/:id/assign-driver
router.put('/:id/assign-driver', async (req, res) => {
    try {
        const { driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({ message: 'Driver ID is required' });
        }

        // Verify driver exists and is approved
        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (driver.role !== 'driver') {
            return res.status(400).json({ message: 'User is not a driver' });
        }

        if (driver.approvalStatus !== 'Approved') {
            return res.status(400).json({ message: 'Driver is not approved' });
        }

        // Find and update order
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Assign driver and update status
        order.driver = driverId;
        order.status = 'Ready for Delivery';
        const updatedOrder = await order.save();

        // Populate driver info for response
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate('driver', 'name email phone vehicleNumber vehicleType')
            .populate('items.product', 'name');

        console.log(`✅ Driver ${driver.name} assigned to order ${order.orderId}`);

        res.json({
            message: 'Driver assigned successfully',
            order: populatedOrder
        });
    } catch (error: any) {
        console.error('Driver assignment error:', error);
        res.status(500).json({ message: error.message || 'Failed to assign driver' });
    }
});


// @desc    Update order location
// @route   PUT /api/orders/:id/location
router.put('/:id/location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.currentLocation = {
                lat,
                lng,
                updatedAt: new Date()
            };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid location update' });
    }
});
// @desc    Send order to logistics
// @route   PUT /api/orders/:id/send-to-logistics
router.put('/:id/send-to-logistics', async (req, res) => {
    try {
        const { clerkId } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'ReadyForDispatch';
        order.sentToLogistics = true;
        order.sentAt = new Date();
        order.sentBy = clerkId;

        const updatedOrder = await order.save();

        // Create notification for logistics officers
        const Notification = mongoose.model('Notification');
        const User = mongoose.model('User');

        // Find logistics officers to notify
        const logisticsOfficers = await User.find({ role: 'logistics', status: 'Active' });

        for (const officer of logisticsOfficers) {
            await Notification.create({
                recipient: officer._id,
                title: 'New Dispatch Ready',
                message: `Order #${order.orderId} is ready for dispatch from ${order.deliveryCenter} center.`,
                type: 'OrderUpdate',
                relatedId: order._id
            });
        }

        res.json(updatedOrder);
    } catch (error: any) {
        console.error('Send to logistics error:', error);
        res.status(500).json({ message: error.message || 'Failed to send to logistics' });
    }
});

export default router;
