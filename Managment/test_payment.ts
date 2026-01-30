import axios from 'axios';

const testPayment = async () => {
    try {
        console.log('Testing /api/payments/create-payment-intent...');
        const response = await axios.post('http://localhost:5001/api/payments/create-payment-intent', {
            amount: 10.5,
            currency: 'usd'
        });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error('ERROR (Backend):', error.response.status, error.response.data);
            } else {
                console.error('ERROR (Network):', error.message);
            }
        } else {
            console.error('ERROR:', error);
        }
    }
};

testPayment();
