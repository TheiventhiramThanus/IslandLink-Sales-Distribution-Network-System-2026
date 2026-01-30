export const formatPrice = (price: number, currency: 'USD' | 'LKR' = 'USD') => {
    if (currency === 'LKR') {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price * 300); // Simulated conversion rate
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};
