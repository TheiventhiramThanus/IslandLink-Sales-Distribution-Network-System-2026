import express from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

const router = express.Router();

// Get Executive Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingDeliveries = await Order.countDocuments({
            status: { $in: ['Processing', 'Ready for Delivery', 'In Transit'] }
        });

        // Aggregate Revenue
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Aggregate Stock Value (Assuming avg price $100 for estimation as price isn't in Product model)
        // ideally Product model should have 'costPrice' or 'sellingPrice'
        const stockAgg = await Product.aggregate([
            { $group: { _id: null, totalStock: { $sum: "$stock" } } }
        ]);
        const totalStockitems = stockAgg.length > 0 ? stockAgg[0].totalStock : 0;
        const estimatedStockValue = totalStockitems * 150; // Estimated avg value

        res.json({
            totalRevenue,
            totalOrders,
            pendingDeliveries,
            inventoryValue: estimatedStockValue,
            deliveryRate: 98.5 // Mocked for now or calculate based on delivered/total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Sales Performance Stats
router.get('/sales', async (req, res) => {
    try {
        // Sales Rep Performance
        const salesReps = await User.find({ role: 'sales' });
        const repStats = await Promise.all(salesReps.map(async (rep) => {
            const orders = await Order.find({ salesRep: rep._id });
            const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            return {
                name: rep.name,
                orders: orders.length,
                revenue,
                conversion: '85%' // Placeholder or complex calculation
            };
        }));

        // Monthly Sales Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format for Recharts
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = monthlyAgg.map(item => ({
            month: months[item._id - 1],
            sales: item.totalSales,
            orders: item.count
        }));

        res.json({
            repPerformance: repStats,
            salesTrend: trendData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Inventory Reports
router.get('/inventory', async (req, res) => {
    try {
        const products = await Product.find();
        const lowStock = products.filter(p => p.available < 20).length;
        const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

        // Distribution by RDC
        const rdcAgg = await Product.aggregate([
            { $group: { _id: "$rdc", count: { $sum: "$stock" } } }
        ]);

        const rdcData = rdcAgg.map(item => ({
            name: item._id,
            value: item.count
        }));

        res.json({
            totalStock,
            lowStock,
            rdcDistribution: rdcData,
            products: products // Start sending full list for table, or paginate later
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Delivery Analytics
router.get('/delivery', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const delivered = await Order.countDocuments({ status: 'Delivered' });
        const inTransit = await Order.countDocuments({ status: 'In Transit' });
        const pending = await Order.countDocuments({ status: 'Pending' });

        res.json({
            totalOrders,
            delivered,
            inTransit,
            pending,
            onTimeRate: 94.2 // Placeholder
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Staff Performance (Drivers & Sales Reps)
router.get('/staff', async (req, res) => {
    try {
        // Sales Reps Logic
        const salesReps = await User.find({ role: 'sales' });
        const salesPerformance = await Promise.all(salesReps.map(async (rep) => {
            const orders = await Order.find({ salesRep: rep._id });
            const revenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            return {
                id: rep._id,
                name: rep.name,
                role: 'Sales Representative',
                metric1: 'Revenue',
                value1: revenue,
                metric2: 'Orders',
                value2: orders.length,
                performanceScore: 85 // Placeholder
            };
        }));

        // Drivers Logic
        const drivers = await User.find({ role: 'driver' });
        const driverPerformance = await Promise.all(drivers.map(async (driver) => {
            const orders = await Order.find({ driver: driver._id, status: 'Delivered' });
            // Mocking on-time rate as we don't have expected delivery time yet
            const onTime = orders.length > 0 ? Math.floor(Math.random() * 20) + 80 : 0;
            return {
                id: driver._id,
                name: driver.name,
                role: 'Delivery Driver',
                metric1: 'Deliveries',
                value1: orders.length,
                metric2: 'On-Time Rate',
                value2: `${onTime}%`,
                performanceScore: onTime
            };
        }));

        res.json({
            sales: salesPerformance,
            drivers: driverPerformance
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Get Route Efficiency Analytics
// Get Route Efficiency Analytics
router.get('/routes', async (req, res) => {
    try {
        // Real-time aggregation from Orders
        const totalOrders = await Order.countDocuments();
        if (totalOrders === 0) return res.json([]);

        // Calculate efficiency based on Delivered vs Total Non-Pending
        const deliveredCount = await Order.countDocuments({ status: 'Delivered' });
        const issueCount = await Order.countDocuments({ status: { $regex: /Issue/i } });
        const activeCount = await Order.countDocuments({ status: { $in: ['In Transit', 'Processing'] } });

        // Since we don't have structured "Region" data in the Order model, 
        // we will provide a "System Wide" analysis and potentially group by available address keywords if feasible.
        // For this implementation, we'll return a System Wide metric and a breakdown by Status as "Routes".

        const efficiency = totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 100;

        // We can mimic "Regions" by grouping by the first part of the address string if available, 
        // but for safety/clarity, we'll show meaningful categories.

        const routeStats = [
            {
                region: 'System Wide',
                deliveries: totalOrders,
                avgTime: 45, // Placeholder as we don't track time-to-deliver in DB yet
                efficiency: efficiency
            },
            {
                region: 'Active Routes',
                deliveries: activeCount,
                avgTime: 30,
                efficiency: 100
            },
            {
                region: 'Completed',
                deliveries: deliveredCount,
                avgTime: 0,
                efficiency: 100
            }
        ];

        res.json(routeStats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
