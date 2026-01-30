import { emailService } from './services/emailService';
import dotenv from 'dotenv';

dotenv.config();

const testEmailSystem = async () => {
    console.log('🧪 EMAIL SYSTEM DIAGNOSTIC TEST');
    console.log('━'.repeat(70));
    console.log('');

    // Test 1: Check Configuration
    console.log('📋 TEST 1: Configuration Check');
    console.log('━'.repeat(70));
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
    console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID || 'Not set');
    console.log('EMAILJS_PUBLIC_KEY:', process.env.EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
    console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID || 'Not set');
    console.log('');

    // Test 2: Test Email Service Configuration
    console.log('📋 TEST 2: Email Service Test');
    console.log('━'.repeat(70));
    const configTest = await emailService.testEmailConfiguration();
    console.log('Service configured:', configTest.configured ? '✅ Yes' : '❌ No');
    console.log('Service type:', configTest.service);
    console.log('From email:', configTest.from);
    console.log('');

    // Test 3: Send Test Email
    console.log('📋 TEST 3: Sending Test Email');
    console.log('━'.repeat(70));

    const testEmail = process.argv[2] || 'test@example.com';
    console.log(`Sending test email to: ${testEmail}`);
    console.log('');

    try {
        const result = await emailService.sendRegistrationEmail({
            name: 'Test User',
            email: testEmail
        });

        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('Result:', result);
        } else {
            console.log('❌ Email failed to send');
            console.log('Message:', result.message);
        }
    } catch (error: any) {
        console.log('❌ Error sending email:', error.message);
        console.error(error);
    }

    console.log('');
    console.log('━'.repeat(70));
    console.log('📊 DIAGNOSTIC COMPLETE');
    console.log('━'.repeat(70));
    console.log('');

    // Summary
    console.log('📝 SUMMARY:');
    console.log('');
    console.log('Backend Email Service (Resend):');
    console.log('  - Status:', process.env.RESEND_API_KEY ? '✅ Active' : '❌ Not configured');
    console.log('  - From:', process.env.EMAIL_FROM || 'Not set');
    console.log('  - Purpose: Automatic emails (orders, registrations, etc.)');
    console.log('');
    console.log('Frontend Email Service (EmailJS):');
    console.log('  - Service ID:', process.env.EMAILJS_SERVICE_ID || '❌ Not set');
    console.log('  - Template ID:', process.env.EMAILJS_TEMPLATE_ID || '❌ Not set');
    console.log('  - Public Key:', process.env.EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Not set');
    console.log('  - Purpose: User-triggered emails (contact forms, etc.)');
    console.log('');

    if (!process.env.RESEND_API_KEY) {
        console.log('⚠️  WARNING: Resend API key is missing!');
        console.log('   Emails will be logged but not actually sent.');
        console.log('   Add RESEND_API_KEY to your .env file.');
        console.log('');
    }

    console.log('💡 TIPS:');
    console.log('  1. Check your spam folder for test emails');
    console.log('  2. Verify email address is correct');
    console.log('  3. Check Resend dashboard: https://resend.com/emails');
    console.log('  4. Free tier: 100 emails/day, 3,000/month');
    console.log('');

    process.exit(0);
};

// Run the test
console.log('');
console.log('Starting email diagnostic...');
console.log('Usage: npx ts-node server/test_email_diagnostic.ts [email@example.com]');
console.log('');

testEmailSystem();
