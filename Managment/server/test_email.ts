import dotenv from 'dotenv';
import { emailService } from './services/emailService';

dotenv.config();

async function testEmail() {
    console.log('🧪 Testing Email Service...\n');

    // Check if API key is configured
    console.log('📋 Configuration Check:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'ISDN System <onboarding@resend.dev>');
    console.log('');

    // Test sending a registration email
    try {
        console.log('📧 Sending test registration email...');
        await emailService.sendRegistrationEmail({
            name: 'Test User',
            email: 'test@example.com', // Replace with your actual email to test
        });
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
}

testEmail();
