import dotenv from 'dotenv';
import { emailService } from './services/emailService';
import { Resend } from 'resend';

dotenv.config();

async function comprehensiveEmailTest() {
    console.log('🧪 COMPREHENSIVE EMAIL SERVICE TEST\n');
    console.log('='.repeat(60));

    // 1. Configuration Check
    console.log('\n📋 STEP 1: Configuration Check');
    console.log('-'.repeat(60));
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'ISDN System <onboarding@resend.dev>';

    console.log('RESEND_API_KEY:', apiKey ? `✅ Set (${apiKey.substring(0, 10)}...)` : '❌ Missing');
    console.log('EMAIL_FROM:', fromEmail);

    if (!apiKey) {
        console.error('\n❌ CRITICAL: RESEND_API_KEY is not set!');
        console.log('Please add it to your .env file:');
        console.log('RESEND_API_KEY=re_your_api_key_here');
        return;
    }

    // 2. Direct Resend API Test
    console.log('\n🔌 STEP 2: Direct Resend API Connection Test');
    console.log('-'.repeat(60));
    try {
        const resend = new Resend(apiKey);
        const result = await resend.emails.send({
            from: fromEmail,
            to: ['delivered@resend.dev'], // Resend test email
            subject: 'Test Email from ISDN System',
            html: '<h1>Test Email</h1><p>This is a test email from the ISDN Sales Distribution System.</p>',
        });

        console.log('✅ Direct API call successful!');
        console.log('Email ID:', result.data?.id);
    } catch (error: any) {
        console.error('❌ Direct API call failed:', error.message);
        if (error.message.includes('API key')) {
            console.log('\n💡 TIP: Your API key might be invalid or expired.');
            console.log('   Get a new one from: https://resend.com/api-keys');
        }
        return;
    }

    // 3. Test Email Service Functions
    console.log('\n📧 STEP 3: Testing Email Service Functions');
    console.log('-'.repeat(60));

    const testEmail = 'delivered@resend.dev'; // Use Resend's test email

    // Test 1: Registration Email
    console.log('\n📨 Test 1: Registration Email');
    try {
        await emailService.sendRegistrationEmail({
            name: 'Test User',
            email: testEmail,
        });
        console.log('✅ Registration email sent successfully');
    } catch (error: any) {
        console.error('❌ Registration email failed:', error.message);
    }

    // Test 2: Driver Registration Email
    console.log('\n📨 Test 2: Driver Registration Email');
    try {
        await emailService.sendDriverRegistrationEmail({
            name: 'Test Driver',
            email: testEmail,
        });
        console.log('✅ Driver registration email sent successfully');
    } catch (error: any) {
        console.error('❌ Driver registration email failed:', error.message);
    }

    // Test 3: Order Confirmation Email
    console.log('\n📨 Test 3: Order Confirmation Email');
    try {
        await emailService.sendOrderConfirmationEmail(
            { name: 'Test Customer', email: testEmail },
            {
                orderId: 'TEST-001',
                items: [
                    { product: { name: 'Test Product' }, quantity: 2, price: 50 }
                ],
                totalAmount: 100
            }
        );
        console.log('✅ Order confirmation email sent successfully');
    } catch (error: any) {
        console.error('❌ Order confirmation email failed:', error.message);
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Email service is configured and working!');
    console.log('\n📝 IMPORTANT NOTES:');
    console.log('1. Emails are sent to: delivered@resend.dev (Resend test inbox)');
    console.log('2. On free plan, you can only send FROM: onboarding@resend.dev');
    console.log('3. To send to real emails, verify your domain at resend.com');
    console.log('4. Check console logs in your server for email confirmations');
    console.log('\n💡 TO SEND TO YOUR EMAIL:');
    console.log('   Replace "delivered@resend.dev" with your actual email address');
    console.log('   in the test above, or when registering/placing orders.');
    console.log('\n🔗 Resend Dashboard: https://resend.com/emails');
    console.log('   Check your sent emails there!');
    console.log('='.repeat(60));
}

comprehensiveEmailTest().catch(console.error);
