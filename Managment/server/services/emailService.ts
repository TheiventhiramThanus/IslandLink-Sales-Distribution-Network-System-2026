import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'ISDN System <onboarding@resend.dev>';

// EmailJS configuration for fallback
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_keq6uts';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'gacqATjpaYlYrowdS';

export const emailService = {
    /**
     * Send welcome email to newly registered users
     */
    sendRegistrationEmail: async (user: { name: string; email: string }) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing. Email will not be sent.');
                console.log(`📧 Would send registration email to: ${user.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1>Welcome to ISDN!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p>Hi ${user.name},</p>
                        <p>Your account has been successfully created. You can now log in to the ISDN Customer Portal to browse products and place orders.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3000/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Your Account</a>
                        </div>
                        <p>If you have any questions, feel free to reply to this email.</p>
                        <p>Best regards,<br>The ISDN Team</p>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [user.email],
                subject: 'Welcome to ISDN - Your Account is Ready',
                html,
            });

            console.log(`✅ Registration email sent to ${user.email}`);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Failed to send registration email:', error.message);
            console.log(`📧 Attempted to send to: ${user.email}`);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send driver registration confirmation email
     */
    sendDriverRegistrationEmail: async (driver: { name: string; email: string }) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                console.log(`📧 Would send driver registration email to: ${driver.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1>🚚 Driver Registration Received!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p>Hi ${driver.name},</p>
                        <p>Thank you for registering as a delivery driver with ISDN Distribution System!</p>
                        
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #92400e;">⏳ Application Under Review</p>
                            <p style="margin: 5px 0 0 0; color: #78350f;">Your application is currently being reviewed by our admin team. You will receive an email notification once your account is approved.</p>
                        </div>

                        <h3>What's Next?</h3>
                        <ul>
                            <li>Our team will verify your documents</li>
                            <li>You'll receive an approval notification via email</li>
                            <li>Once approved, you can log in to the Driver App</li>
                        </ul>

                        <p>If you have any questions, feel free to contact our support team.</p>
                        <p>Best regards,<br>The ISDN Team</p>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [driver.email],
                subject: 'Driver Registration Received - ISDN',
                html,
            });

            console.log(`✅ Driver registration email sent to ${driver.email}`);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Failed to send driver registration email:', error.message);
            console.log(`📧 Attempted to send to: ${driver.email}`);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send notification to admin about new driver registration
     */
    sendNewDriverNotificationEmail: async (admin: { name: string; email: string }, driver: any) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                console.log(`📧 Would send admin notification to: ${admin.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #6366f1; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1>🔔 New Driver Registration</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p>Hi ${admin.name},</p>
                        <p>A new driver has registered and is awaiting approval.</p>
                        
                        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Driver Details:</h3>
                            <p><strong>Name:</strong> ${driver.name}</p>
                            <p><strong>Email:</strong> ${driver.email}</p>
                            <p><strong>Phone:</strong> ${driver.phone || 'N/A'}</p>
                            <p><strong>Vehicle:</strong> ${driver.vehicleType || 'N/A'} (${driver.vehicleNumber || 'N/A'})</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3001/" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Application</a>
                        </div>

                        <p>Please review the driver's documents and approve or reject the application.</p>
                        <p>Best regards,<br>ISDN System</p>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [admin.email],
                subject: `New Driver Registration: ${driver.name}`,
                html,
            });

            console.log(`✅ Admin notification sent to ${admin.email}`);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Failed to send admin notification:', error.message);
            console.log(`📧 Attempted to send to: ${admin.email}`);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send driver approval email
     */
    sendDriverApprovalEmail: async (driver: { name: string; email: string }) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                console.log(`📧 Would send approval email to: ${driver.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #10b981; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1>✅ Application Approved!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p>Hi ${driver.name},</p>
                        <p>Great news! Your driver application has been approved by our admin team.</p>
                        
                        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #065f46;">🎉 You're All Set!</p>
                            <p style="margin: 5px 0 0 0; color: #047857;">You can now log in to the ISDN Driver App and start accepting delivery assignments.</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:3005/" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open Driver App</a>
                        </div>

                        <p>Welcome to the ISDN team! We're excited to have you on board.</p>
                        <p>Best regards,<br>The ISDN Team</p>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [driver.email],
                subject: '🎉 Your Driver Application is Approved!',
                html,
            });

            console.log(`✅ Driver approval email sent to ${driver.email}`);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Failed to send driver approval email:', error.message);
            console.log(`📧 Attempted to send to: ${driver.email}`);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send driver rejection email
     */
    sendDriverRejectionEmail: async (driver: { name: string; email: string }, reason: string) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                console.log(`📧 Would send rejection email to: ${driver.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #ef4444; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1>Application Status Update</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                        <p>Hi ${driver.name},</p>
                        <p>Thank you for your interest in becoming a driver with ISDN Distribution System.</p>
                        
                        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #991b1b;">Application Not Approved</p>
                            <p style="margin: 10px 0 0 0; color: #7f1d1d;"><strong>Reason:</strong> ${reason}</p>
                        </div>

                        <p>If you believe this was a mistake or would like to reapply with updated information, please contact our support team.</p>
                        <p>Best regards,<br>The ISDN Team</p>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [driver.email],
                subject: 'Driver Application Status - ISDN',
                html,
            });

            console.log(`✅ Driver rejection email sent to ${driver.email}`);
            return { success: true, data: result };
        } catch (error: any) {
            console.error('❌ Failed to send driver rejection email:', error.message);
            console.log(`📧 Attempted to send to: ${driver.email}`);
            return { success: false, message: error.message };
        }
    },

    /**
     * Test email configuration
     */
    testEmailConfiguration: async () => {
        console.log('\n🧪 Testing Email Configuration...');
        console.log('━'.repeat(60));
        console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing');
        console.log('EMAIL_FROM:', FROM_EMAIL);
        console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID);
        console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY);
        console.log('━'.repeat(60));


        if (!process.env.RESEND_API_KEY) {
            console.log('\n⚠️  WARNING: Email service is not fully configured!');
            console.log('Emails will be logged but not sent.');
            console.log('\nTo fix:');
            console.log('1. Check .env file has RESEND_API_KEY');
            console.log('2. Or use EmailJS for client-side emails');
        } else {
            console.log('\n✅ Email service is configured and ready!');
        }

        return {
            configured: !!process.env.RESEND_API_KEY,
            service: 'Resend',
            from: FROM_EMAIL
        };
    },

    /**
     * Send order confirmation email
     */
    sendOrderConfirmationEmail: async (user: { name: string; email: string }, order: any) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                console.log(`📧 Would send order confirmation to: ${user.email}`);
                return { success: false, message: 'Email service not configured' };
            }

            const itemsList = order.items
                ?.map((item: any) => `<li>${item.product?.name || 'Product'} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</li>`)
                .join('') || '<li>No items</li>';

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
                        <h1>✅ Order Confirmed!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #e5e7eb;">
                        <p>Hi ${user.name},</p>
                        <p>Thank you for your order!</p>
                        <p><strong>Order ID:</strong> ${order.orderId || 'N/A'}</p>
                        <p><strong>Items:</strong></p>
                        <ul>${itemsList}</ul>
                        <p><strong>Total: $${(order.totalAmount || 0).toFixed(2)}</strong></p>
                        <p>Best regards,<br>The ISDN Team</p>
                    </div>
                </div>
            `;

            await resend.emails.send({
                from: FROM_EMAIL,
                to: [user.email],
                subject: `Order Confirmation #${order.orderId || 'N/A'}`,
                html,
            });

            console.log(`✅ Order confirmation email sent to ${user.email}`);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Failed to send order confirmation email:', error.message);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send order status update email
     */
    sendOrderStatusUpdateEmail: async (user: { name: string; email: string }, order: any) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                return { success: false };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Order Status Update</h1>
                    <p>Hi ${user.name},</p>
                    <p>Order ${order.orderId} status: <strong>${order.status}</strong></p>
                </div>
            `;

            await resend.emails.send({
                from: FROM_EMAIL,
                to: [user.email],
                subject: `Order ${order.orderId} - Status: ${order.status}`,
                html,
            });

            console.log(`✅ Status update email sent to ${user.email}`);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Failed to send status update:', error.message);
            return { success: false };
        }
    },

    /**
     * Send order cancellation email
     */
    sendOrderCancellationEmail: async (user: { name: string; email: string }, order: any, refundAmount: number = 0) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                return { success: false };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Order Cancelled</h1>
                    <p>Hi ${user.name},</p>
                    <p>Order ${order.orderId} has been cancelled.</p>
                    ${refundAmount > 0 ? `<p>Refund: $${refundAmount.toFixed(2)}</p>` : ''}
                </div>
            `;

            await resend.emails.send({
                from: FROM_EMAIL,
                to: [user.email],
                subject: `Order ${order.orderId} - Cancelled`,
                html,
            });

            console.log(`✅ Cancellation email sent to ${user.email}`);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Failed to send cancellation email:', error.message);
            return { success: false };
        }
    },

    /**
     * Send invoice email
     */
    sendInvoiceEmail: async (recipientEmail: string, order: any) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('⚠️ RESEND_API_KEY missing.');
                return { success: false, message: 'Email service not configured' };
            }

            const itemsList = order.items
                ?.map((item: any) => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Product'}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `)
                .join('') || '<tr><td colspan="4" style="padding: 10px; text-align: center;">No items found</td></tr>';

            const html = `
                <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background: #1e293b; color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">INVOICE</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.8;">Order #${order.orderId}</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                            <div>
                                <h3 style="margin: 0 0 10px 0; color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Billed To</h3>
                                <p style="margin: 0; font-weight: bold; font-size: 16px;">${order.customer}</p>
                                <p style="margin: 5px 0 0 0; color: #64748b;">${recipientEmail}</p>
                                <p style="margin: 5px 0 0 0; color: #64748b;">${order.address || 'No address provided'}</p>
                            </div>
                            <div style="text-align: right;">
                                <h3 style="margin: 0 0 10px 0; color: #64748b; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Invoice Date</h3>
                                <p style="margin: 0; font-weight: bold; font-size: 16px;">${new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 13px;">Item Description</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 13px;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 13px;">Rate</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 13px;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>

                        <div style="display: flex; justify-content: flex-end;">
                            <div style="width: 250px;">
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="color: #64748b;">Subtotal</span>
                                    <span style="font-weight: bold;">$${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <span style="color: #64748b;">Tax (0%)</span>
                                    <span style="font-weight: bold;">$0.00</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 20px 0; background: #f8fafc; margin-top: 10px; padding-left: 10px; padding-right: 10px; border-radius: 4px;">
                                    <span style="font-weight: bold; color: #1e293b;">Total Amount</span>
                                    <span style="font-weight: bold; color: #2563eb; font-size: 18px;">$${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                            <p>Thank you for choosing ISDN Distribution System!</p>
                            <p>If you have any questions about this invoice, please contact support@isdn-system.com</p>
                        </div>
                    </div>
                </div>
            `;

            const result = await resend.emails.send({
                from: FROM_EMAIL,
                to: [recipientEmail],
                subject: `Invoice for Order #${order.orderId}`,
                html,
            });

            console.log(`✅ Invoice email sent to ${recipientEmail}`);
            return { success: true, emailId: result.data?.id };
        } catch (error: any) {
            console.error('❌ Failed to send invoice email:', error.message);
            return { success: false, message: error.message };
        }
    },

    /**
     * Send login notification email
     */
    sendLoginNotificationEmail: async (user: { name: string; email: string; role: string }, info: { timestamp: Date; ip?: string; device?: string }) => {
        try {
            if (!process.env.RESEND_API_KEY) {
                // Silent return or warn for login notifications to act as non-critical
                return { success: false, message: 'Email service not configured' };
            }

            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>New Login Detected</h1>
                    <p>Hi ${user.name},</p>
                    <p>We detected a new login to your account.</p>
                    <ul>
                        <li><strong>Time:</strong> ${info.timestamp.toLocaleString()}</li>
                        <li><strong>Device:</strong> ${info.device || 'Unknown'}</li>
                        <li><strong>IP:</strong> ${info.ip || 'Unknown'}</li>
                    </ul>
                    <p>If this was you, you can ignore this email. If not, please contact support immediately.</p>
                </div>
            `;

            await resend.emails.send({
                from: FROM_EMAIL,
                to: [user.email],
                subject: 'New Login Detected - ISDN System',
                html,
            });

            console.log(`✅ Login notification sent to ${user.email}`);
            return { success: true };
        } catch (error: any) {
            console.error('❌ Failed to send login notification:', error.message);
            return { success: false, message: error.message };
        }
    }
};

// Test configuration on import
emailService.testEmailConfiguration();

export default emailService;
