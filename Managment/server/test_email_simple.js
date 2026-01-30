const { Resend } = require('resend');
require('dotenv').config();

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || 'ISDN System <onboarding@resend.dev>';

console.log('API Key:', apiKey ? 'Set' : 'Missing');
console.log('From Email:', fromEmail);

if (!apiKey) {
    console.error('ERROR: RESEND_API_KEY not found in environment');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function test() {
    try {
        console.log('\nSending test email...');
        const result = await resend.emails.send({
            from: fromEmail,
            to: ['delivered@resend.dev'],
            subject: 'Test from ISDN',
            html: '<h1>Test Email</h1><p>If you see this, email is working!</p>',
        });

        console.log('SUCCESS! Email sent.');
        console.log('Email ID:', result.data?.id);
        console.log('\nCheck https://resend.com/emails to see your sent emails');
    } catch (error) {
        console.error('FAILED:', error.message);
        console.error('Full error:', error);
    }
}

test();
