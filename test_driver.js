const axios = require('axios');

async function testDriverFlow() {
    const URL = 'http://localhost:5001/api/drivers';
    console.log('--- Testing Driver Registration ---');
    try {
        const regRes = await axios.post(`${URL}/register`, {
            name: "Test Driver",
            email: "tdriver@example.com",
            password: "password123",
            phone: "0771234567",
            address: "Colombo",
            distributionCenter: "Central",
            vehicleType: "Van",
            vehicleNumber: "WP-ABC-1234",
            licenseNumber: "B1234567",
            nicNumber: "199012345678"
        });
        console.log('Registration Success:', regRes.data);
    } catch (error) {
        console.error('Registration Failed (expected if already exists):', error.response?.data || error.message);
    }

    console.log('\n--- Testing Driver Login (Pending Driver) ---');
    try {
        const loginRes = await axios.post(`${URL}/login`, {
            email: "tdriver@example.com",
            password: "password123"
        });
        console.log('Login Result (Unexpected Success):', loginRes.data);
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('Login Blocked as Expected (Status 403):', error.response.data);
        } else {
            console.error('Login Error:', error.response?.data || error.message);
        }
    }
}

testDriverFlow();
