import express from 'express';
import Order from '../models/Order';

import { Resend } from 'resend';

import { emailService } from '../services/emailService';

const router = express.Router();

// @desc    Send invoice email (Real)
// @route   POST /api/invoices/send
router.post('/send', async (req, res) => {
    try {
        const { orderId, recipientEmail } = req.body;

        // Get order details
        const order = await Order.findById(orderId).populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Send email via service
        const result = await emailService.sendInvoiceEmail(recipientEmail, order);

        if (!result.success) {
            throw new Error(result.message);
        }

        console.log(`📧 Invoice email sent successfully to ${recipientEmail}. ID: ${result.emailId}`);

        res.json({
            success: true,
            message: `Invoice sent successfully to ${recipientEmail}`,
            emailId: result.emailId,
            order: {
                orderId: order.orderId,
                customer: order.customer,
                totalAmount: order.totalAmount,
                status: order.status
            }
        });

    } catch (error: any) {
        console.error('Email send error:', error);
        res.status(500).json({ message: error.message || 'Failed to send invoice' });
    }
});

// @desc    Generate invoice data
// @route   POST /api/invoices/generate
router.post('/generate', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            success: true,
            invoice: {
                invoiceNumber: `INV-${order.orderId}`,
                date: order.orderDate,
                customer: order.customer,
                address: order.address,
                items: order.items,
                totalAmount: order.totalAmount,
                status: order.status,
                priority: order.priority
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to generate invoice' });
    }
});

// @desc    Get invoice preview
// @route   GET /api/invoices/:orderId
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('items.product', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({
            success: true,
            invoice: {
                invoiceNumber: `INV-${order.orderId}`,
                orderId: order.orderId,
                date: order.orderDate,
                customer: order.customer,
                address: order.address,
                items: order.items.map((item: any) => ({
                    name: item.product?.name || 'Product',
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.quantity * item.price
                })),
                totalAmount: order.totalAmount,
                status: order.status,
                isPaid: order.status === 'Delivered'
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to get invoice' });
    }
});

export default router;
