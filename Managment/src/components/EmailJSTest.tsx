import React, { useState } from 'react';
import emailJSService from '../services/emailJSService';

const EmailJSTest = () => {
    const [serviceId, setServiceId] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [toEmail, setToEmail] = useState('');
    const [toName, setToName] = useState('');
    const [subject, setSubject] = useState('Test Email from ISDN');
    const [message, setMessage] = useState('This is a test email to verify EmailJS integration.');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setResult(null);

        try {
            const response = await emailJSService.sendEmail(
                serviceId,
                templateId,
                {
                    to_email: toEmail,
                    to_name: toName,
                    subject: subject,
                    message: message
                }
            );

            setResult(response);
        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Failed to send email'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📧 EmailJS Test Panel</h2>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">🔑 Your API Keys (Configured)</h3>
                <p className="text-sm text-blue-700">Public Key: uTmEiAcJ2z3qL5yFz</p>
                <p className="text-sm text-blue-700 mt-1">Private Key: kELnicj7AtBZbtnY0nXOZ</p>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Setup Required</h3>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://dashboard.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS Dashboard</a></li>
                    <li>Create an Email Service (Gmail, Outlook, etc.)</li>
                    <li>Create an Email Template</li>
                    <li>Copy Service ID and Template ID below</li>
                </ol>
            </div>

            <form onSubmit={handleTest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service ID *
                        </label>
                        <input
                            type="text"
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                            placeholder="service_xxxxxxx"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">From EmailJS Dashboard → Email Services</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Template ID *
                        </label>
                        <input
                            type="text"
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            placeholder="template_xxxxxxx"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">From EmailJS Dashboard → Email Templates</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient Email *
                    </label>
                    <input
                        type="email"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipient Name *
                    </label>
                    <input
                        type="text"
                        value={toName}
                        onChange={(e) => setToName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {sending ? '📤 Sending...' : '📧 Send Test Email'}
                </button>
            </form>

            {result && (
                <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.success ? '✅ Success!' : '❌ Error'}
                    </h3>
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                    </p>
                    {result.success && (
                        <p className="text-sm text-green-600 mt-2">
                            Check your email inbox at <strong>{toEmail}</strong>
                        </p>
                    )}
                </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">📝 Template Variables</h3>
                <p className="text-sm text-gray-700 mb-2">Use these in your EmailJS template:</p>
                <ul className="text-sm text-gray-600 space-y-1 font-mono">
                    <li>{'{{to_name}}'} - Recipient's name</li>
                    <li>{'{{to_email}}'} - Recipient's email</li>
                    <li>{'{{from_name}}'} - Sender's name (ISDN System)</li>
                    <li>{'{{subject}}'} - Email subject</li>
                    <li>{'{{message}}'} - Email message body</li>
                    <li>{'{{reply_to}}'} - Reply-to email</li>
                </ul>
            </div>
        </div>
    );
};

export default EmailJSTest;
