const axios = require('axios');

async function verifyLogin() {
    const URL = 'http://localhost:5001/api/drivers/login';
    console.log('--- Verifying Driver Login for driver@isdn.com ---');
    try {
        const response = await axios.post(URL, {
            email: "driver@isdn.com",
            password: "password123"
        });
        console.log('Login Result:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Login Failed:', error.response?.data || error.message);
    }
}

verifyLogin();
