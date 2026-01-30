async function testDriverFlow() {
    const URL = 'http://localhost:5001/api/drivers';
    console.log('--- Testing Driver Registration ---');
    try {
        const regRes = await fetch(`${URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
            })
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status, regData);
    } catch (error) {
        console.error('Registration Error:', error.message);
    }

    console.log('\n--- Testing Driver Login (Pending Driver) ---');
    try {
        const loginRes = await fetch(`${URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "tdriver@example.com",
                password: "password123"
            })
        });
        const loginData = await loginRes.json();
        if (loginRes.status === 403) {
            console.log('Login Blocked as Expected (Status 403):', loginData);
        } else {
            console.log('Login Status:', loginRes.status, loginData);
        }
    } catch (error) {
        console.error('Login Error:', error.message);
    }
}

testDriverFlow();
