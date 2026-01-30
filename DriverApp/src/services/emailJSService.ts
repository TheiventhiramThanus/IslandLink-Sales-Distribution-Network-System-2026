import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_keq6uts';
const EMAILJS_TEMPLATE_ID = 'm2KD-rIOQt6GoRA1t';
const EMAILJS_PUBLIC_KEY = 'gacqATjpaYlYrowdS';

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
                    from_name: params.from_name || 'ISDN Driver',
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
     * Send support request email
     */
    sendSupportRequest: async (
        serviceId: string,
        templateId: string,
        driver: { name: string; email: string; message: string }
    ) => {
        return emailJSService.sendEmail(serviceId, templateId, {
            to_email: 'support@isdn.com',
            to_name: 'ISDN Support',
            from_name: driver.name,
            subject: 'Driver Support Request',
            message: `From Driver: ${driver.name} (${driver.email})\n\n${driver.message}`,
            reply_to: driver.email
        });
    }
};

export default emailJSService;
