import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_keq6uts';
const EMAILJS_TEMPLATE_ID = 'm2KD-rIOQt6GoRA1t';
const EMAILJS_PUBLIC_KEY = 'gacqATjpaYlYrowdS';
const EMAILJS_PRIVATE_KEY = 'coWf4GEmW1HYeh1WjO-og';

// Export for easy access
export const EMAIL_CONFIG = {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY
};

// Initialize EmailJS with your public key
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailParams {
    to_email: string;
    to_name: string;
    from_name?: string;
    subject: string;
    message: string;
    reply_to?: string;
}

export const emailJSService = {
    /**
     * Initialize EmailJS (call this once when app starts)
     */
    initialize: () => {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log('📧 EmailJS initialized with public key');
    },

    /**
     * Send a generic email using EmailJS
     * @param serviceId - Your EmailJS service ID (e.g., 'service_xxxxxxx')
     * @param templateId - Your EmailJS template ID (e.g., 'template_xxxxxxx')
     * @param params - Email parameters
     */
    sendEmail: async (
        serviceId: string,
        templateId: string,
        params: EmailParams
    ): Promise<{ success: boolean; message: string }> => {
        try {
            console.log('📧 Sending email via EmailJS...', {
                to: params.to_email,
                subject: params.subject
            });

            const response = await emailjs.send(
                serviceId,
                templateId,
                {
                    to_email: params.to_email,
                    to_name: params.to_name,
                    from_name: params.from_name || 'ISDN System',
                    subject: params.subject,
                    message: params.message,
                    reply_to: params.reply_to || 'noreply@isdn.com'
                },
                EMAILJS_PUBLIC_KEY
            );

            console.log('✅ Email sent successfully:', response);
            return {
                success: true,
                message: 'Email sent successfully'
            };
        } catch (error: any) {
            console.error('❌ Failed to send email:', error);
            return {
                success: false,
                message: error.text || error.message || 'Failed to send email'
            };
        }
    },

    /**
     * Send registration confirmation email
     */
    sendRegistrationEmail: async (
        serviceId: string,
        templateId: string,
        user: { name: string; email: string }
    ) => {
        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: user.email,
            to_name: user.name,
            subject: 'Welcome to ISDN - Registration Successful',
            message: `Hi ${user.name},\n\nThank you for registering with ISDN Sales Distribution System. Your account has been created successfully.\n\nYou can now log in and start using our services.\n\nBest regards,\nThe ISDN Team`
        });
    },

    /**
     * Send order confirmation email
     */
    sendOrderConfirmationEmail: async (
        serviceId: string,
        templateId: string,
        user: { name: string; email: string },
        order: { orderId: string; totalAmount: number; items: any[] }
    ) => {
        const itemsList = order.items
            .map((item: any) => `- ${item.product?.name || 'Product'} x ${item.quantity} = $${item.price}`)
            .join('\n');

        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: user.email,
            to_name: user.name,
            subject: `Order Confirmation #${order.orderId}`,
            message: `Hi ${user.name},\n\nThank you for your order!\n\nOrder ID: #${order.orderId}\n\nItems:\n${itemsList}\n\nTotal: $${order.totalAmount}\n\nWe'll notify you when your order is ready for delivery.\n\nBest regards,\nThe ISDN Team`
        });
    },

    /**
     * Send driver registration email
     */
    sendDriverRegistrationEmail: async (
        serviceId: string,
        templateId: string,
        driver: { name: string; email: string }
    ) => {
        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: driver.email,
            to_name: driver.name,
            subject: 'Driver Registration Received - ISDN',
            message: `Hi ${driver.name},\n\nThank you for registering as a delivery driver with ISDN!\n\nYour application is currently under review by our admin team. You will receive an email notification once your account is approved.\n\nWhat's Next?\n- Our team will verify your documents\n- You'll receive an approval notification via email\n- Once approved, you can log in to the Driver App\n\nIf you have any questions, feel free to contact our support team.\n\nBest regards,\nThe ISDN Team`
        });
    },

    /**
     * Send driver approval email
     */
    sendDriverApprovalEmail: async (
        serviceId: string,
        templateId: string,
        driver: { name: string; email: string }
    ) => {
        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: driver.email,
            to_name: driver.name,
            subject: '🎉 Your Driver Application is Approved!',
            message: `Hi ${driver.name},\n\nGreat news! Your driver application has been approved by our admin team.\n\nYou can now log in to the ISDN Driver App and start accepting delivery assignments.\n\nNext Steps:\n1. Open the ISDN Driver App\n2. Log in with your registered email and password\n3. Complete your profile setup\n4. Start accepting delivery orders\n\nWelcome to the ISDN team! We're excited to have you on board.\n\nBest regards,\nThe ISDN Team`
        });
    },

    /**
     * Send contact form email
     */
    sendContactFormEmail: async (
        serviceId: string,
        templateId: string,
        contact: { name: string; email: string; subject: string; message: string }
    ) => {
        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: 'admin@isdn.com', // Send to admin
            to_name: 'ISDN Admin',
            from_name: contact.name,
            subject: `Contact Form: ${contact.subject}`,
            message: `From: ${contact.name} (${contact.email})\n\nSubject: ${contact.subject}\n\nMessage:\n${contact.message}`,
            reply_to: contact.email
        });
    },

    /**
     * Send custom email with full control
     */
    sendCustomEmail: async (
        serviceId: string,
        templateId: string,
        templateParams: Record<string, any>
    ) => {
        try {
            console.log('📧 Sending custom email via EmailJS...');

            const response = await emailjs.send(
                serviceId,
                templateId,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            console.log('✅ Custom email sent successfully:', response);
            return {
                success: true,
                message: 'Email sent successfully',
                response
            };
        } catch (error: any) {
            console.error('❌ Failed to send custom email:', error);
            return {
                success: false,
                message: error.text || error.message || 'Failed to send email',
                error
            };
        }
    }
};

// Initialize on import
emailJSService.initialize();

export default emailJSService;
