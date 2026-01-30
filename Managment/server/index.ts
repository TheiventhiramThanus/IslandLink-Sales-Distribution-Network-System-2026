import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db';
import dns from 'dns';
import path from 'path';

// Force usage of Google DNS to resolve MongoDB SRV records
// This fixes ENOTFOUND/EAI_AGAIN errors caused by ISP DNS filtering
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 DNS servers set to Google (8.8.8.8) to fix connection issues.');
} catch (e) {
    console.error('⚠️ Failed to set custom DNS servers');
}

// Import Routes
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import driverRoutes from './routes/driverRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import logisticsRoutes from './routes/logisticsRoutes';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware to check database connection status
const dbCheck = (req: any, res: any, next: any) => {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
        console.warn(`⚠️ Blocked request to ${req.path} - DB State: ${state}`);
        return res.status(503).json({
            message: 'Database connection is temporarily unavailable. The system is automatically retrying...',
            status: 'error',
            code: 'DB_CONNECTION_ERROR',
            debug_state: state
        });
    }
    next();
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', dbCheck);

// Routes
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('ISDN Sales Distribution System API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/logistics', logisticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
