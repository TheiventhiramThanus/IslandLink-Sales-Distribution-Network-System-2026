import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_keq6uts';
const EMAILJS_TEMPLATE_ID = 'm2KD-rIOQt6GoRA1t';
const EMAILJS_PUBLIC_KEY = 'MMwC4H6JsB39zSrly';

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
   * Send contact form email
   */
  sendContactForm: async (
    serviceId: string,
    templateId: string,
    contact: { name: string; email: string; subject: string; message: string }
  ) => {
    return emailJSService.sendEmail(serviceId, templateId, {
      to_email: 'admin@isdn.com',
      to_name: 'ISDN Admin',
      from_name: contact.name,
      subject: `Contact: ${contact.subject}`,
      message: `From: ${contact.name} (${contact.email})\n\n${contact.message}`,
      reply_to: contact.email
    });
  },

  /**
   * Send Welcome Email on Registration
   */
  sendWelcomeEmail: async (
    name: string,
    email: string
  ) => {
    return emailJSService.sendEmail(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email,
      to_name: name,
      subject: 'Welcome to IslandLink ISDN!',
      message: `Hi ${name},\n\nWelcome to IslandLink ISDN! We are thrilled to have you on board.\n\nYou can now browse our catalogue, place orders, and manage your account.\n\nBest Regards,\nThe IslandLink Team`
    });
  },

  /**
   * Send Login Notification
   */
  sendLoginNotification: async (
    name: string,
    email: string
  ) => {
    const time = new Date().toLocaleString();
    return emailJSService.sendEmail(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: email,
      to_name: name,
      subject: 'Login Alert - IslandLink ISDN',
      message: `Hi ${name},\n\nNew login detected on your account at ${time}.\n\nIf this wasn't you, please contact support immediately.`
    });
  },

  /**
   * Send Order Confirmation Invoice
   */
  sendOrderConfirmation: async (
    order: any,
    userEmail: string
  ) => {
    const itemsList = order.items.map((item: any) =>
      `- ${item.product.name} x ${item.quantity} (${item.product.price})`
    ).join('\n');

    const message = `
Dear ${order.customer},

Thank you for your order! Here are your order details:

Order ID: ${order.orderId}
Date: ${order.date}
Total Amount: ${order.total}

Items:
${itemsList}

Billing Address:
${order.invoiceAddress || order.address || 'N/A'}

We will notify you once your order is dispatched.

Display Currency used: ${order.currency || 'USD'}
        `.trim();

    return emailJSService.sendEmail(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: userEmail,
      to_name: order.customer,
      subject: `Order Confirmation #${order.orderId}`,
      message: message
    });
  }
};

export default emailJSService;
