import express from 'express';
import mongoose from 'mongoose';
import Assignment from '../models/Assignment';
import Notification from '../models/Notification';
import GPSTracking from '../models/GPSTracking';
import Order from '../models/Order';
import User from '../models/User';
import Vehicle from '../models/Vehicle';

const router = express.Router();

// @desc    Get logistics statistics
// @route   GET /api/logistics/stats
router.get('/stats', async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
            totalAssignments,
            todayAssignments,
            deliveredCount,
            failedCount,
            inTransitCount,
            availableDrivers,
            availableVehicles
        ] = await Promise.all([
            Assignment.countDocuments(),
            Assignment.countDocuments({ assignedAt: { $gte: todayStart, $lte: todayEnd } }),
            Assignment.countDocuments({ status: 'Delivered' }),
            Assignment.countDocuments({ status: 'Failed' }),
            Assignment.countDocuments({ status: 'InTransit' }),
            User.countDocuments({ role: 'driver', status: 'Active', approvalStatus: 'Approved' }),
            Vehicle.countDocuments({ status: 'Active' })
        ]);

        res.json({
            total: totalAssignments,
            today: todayAssignments,
            delivered: deliveredCount,
            failed: failedCount,
            inTransit: inTransitCount,
            drivers: availableDrivers,
            vehicles: availableVehicles
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get Dispatch Queue (Orders ready for assignment)
// @route   GET /api/logistics/dispatch-queue
router.get('/dispatch-queue', async (req, res) => {
    try {
        const { center } = req.query;

        const query: any = {
            status: 'ReadyForDispatch'
        };

        if (center && center !== 'All') {
            query.deliveryCenter = center;
        }

        // Exclude orders already assigned (Active assignments)
        const activeAssignments = await Assignment.find({
            status: { $ne: 'Cancelled' }
        }).distinct('order');

        query._id = { $nin: activeAssignments };

        const orders = await Order.find(query)
            .populate('items.product', 'name')
            .sort({ priority: -1, orderDate: 1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Assign Driver & Vehicle (Step C)
// @route   POST /api/logistics/assign
router.post('/assign', async (req, res) => {
    try {
        const { orderId, driverId, vehicleId, center, adminId } = req.body;

        // 1. Validate Order
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // 2. Validate Driver
        const driver = await User.findById(driverId);
        if (!driver || driver.role !== 'driver') {
            return res.status(400).json({ message: 'Invalid Driver' });
        }
        if (driver.approvalStatus !== 'Approved' || driver.status !== 'Active') {
            return res.status(400).json({ message: 'Driver is not active or approved' });
        }

        // 3. Validate Vehicle
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.status !== 'Active') {
            return res.status(400).json({ message: 'Vehicle is not active' });
        }

        // 4. Center Matching Logic
        const orderCenter = String(order.deliveryCenter).trim().toLowerCase();
        const targetCenter = String(center).trim().toLowerCase();

        if (!orderCenter.includes(targetCenter) && !targetCenter.includes(orderCenter)) {
            return res.status(400).json({ message: `Order belongs to ${order.deliveryCenter} center` });
        }

        // Strict Check: Driver center must match (if set)
        if (driver.company) {
            const driverCenter = String(driver.company).trim().toLowerCase();
            if (!driverCenter.includes(targetCenter) && !targetCenter.includes(driverCenter)) {
                return res.status(400).json({ message: `Driver belongs to ${driver.company}, cannot assign to ${center}` });
            }
        }

        // Strict Check: Vehicle center must match
        if (vehicle.distributionCenter) {
            const vehicleCenter = String(vehicle.distributionCenter).trim().toLowerCase();
            if (!vehicleCenter.includes(targetCenter) && !targetCenter.includes(vehicleCenter)) {
                return res.status(400).json({ message: `Vehicle belongs to ${vehicle.distributionCenter}, cannot assign to ${center}` });
            }
        }

        // 5. Conflict Checking
        // Check if driver is already on an active assignment
        const driverConflict = await Assignment.findOne({
            driver: driverId,
            status: { $in: ['Assigned', 'PickedUp', 'InTransit'] }
        });
        if (driverConflict) {
            return res.status(400).json({ message: 'Driver is currently assigned to another active route' });
        }

        // Check if vehicle is already in use
        const vehicleConflict = await Assignment.findOne({
            vehicle: vehicleId,
            status: { $in: ['Assigned', 'PickedUp', 'InTransit'] }
        });
        if (vehicleConflict) {
            return res.status(400).json({ message: 'Vehicle is currently assigned to another active route' });
        }

        // 6. Create Assignment
        const assignment = new Assignment({
            assignmentId: `ASN-${Date.now()}`,
            order: orderId,
            driver: driverId,
            vehicle: vehicleId,
            assignedBy: adminId, // ID of logged in admin
            center: center,
            status: 'Assigned',
            assignedAt: new Date()
        });

        await assignment.save();

        // 7. Update Order Status
        order.status = 'Assigned';
        order.driver = driverId; // Link driver to order for reference
        await order.save();

        // 8. Create Notification for Driver
        await Notification.create({
            recipient: driverId,
            title: 'New Delivery Assignment',
            message: `You have been assigned to Order #${order.orderId}. Please check your dashboard.`,
            type: 'Assignment',
            relatedId: assignment._id
        });

        res.status(201).json(assignment);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Assignment failed' });
    }
});

// @desc    Get Available Drivers for a center
// @route   GET /api/logistics/available-drivers
router.get('/available-drivers', async (req, res) => {
    try {
        const { center } = req.query;
        if (!center) return res.status(400).json({ message: 'Center is required' });

        const centerStr = String(center).trim();

        // Find drivers who are Approved and Active in this center
        const query: any = {
            role: 'driver',
            approvalStatus: 'Approved',
            status: 'Active',
            $or: [
                { company: { $regex: new RegExp(`^${centerStr}$`, 'i') } },
                { company: { $regex: new RegExp(`^${centerStr} Center$`, 'i') } },
                { company: { $regex: new RegExp(`${centerStr}`, 'i') } }
            ]
        };

        // Find drivers currently on active assignments
        const busyDrivers = await Assignment.find({
            status: { $in: ['Assigned', 'PickedUp', 'InTransit'] }
        }).distinct('driver');

        query._id = { $nin: busyDrivers };

        const drivers = await User.find(query).select('name email phone company image');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get Available Vehicles for a center
// @route   GET /api/logistics/available-vehicles
router.get('/available-vehicles', async (req, res) => {
    try {
        const { center } = req.query;
        if (!center) return res.status(400).json({ message: 'Center is required' });

        const centerStr = String(center).trim();

        // Find vehicles that are Active in this center
        const query: any = {
            status: 'Active',
            $or: [
                { distributionCenter: { $regex: new RegExp(`^${centerStr}$`, 'i') } },
                { distributionCenter: { $regex: new RegExp(`^${centerStr} Center$`, 'i') } },
                { distributionCenter: { $regex: new RegExp(`${centerStr}`, 'i') } }
            ]
        };

        // Find vehicles currently in use
        const busyVehicles = await Assignment.find({
            status: { $in: ['Assigned', 'PickedUp', 'InTransit'] }
        }).distinct('vehicle');

        query._id = { $nin: busyVehicles };

        const vehicles = await Vehicle.find(query).select('vehicleId model licensePlate type distributionCenter');
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get All Assignments (Paginated & Filtered)
// @route   GET /api/logistics/assignments
router.get('/assignments', async (req, res) => {
    try {
        const {
            status,
            center,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const query: any = {};

        if (status && status !== 'All') query.status = status;
        if (center && center !== 'All') query.center = center;

        // Date Range
        if (startDate || endDate) {
            query.assignedAt = {};
            if (startDate) query.assignedAt.$gte = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                query.assignedAt.$lte = end;
            }
        }

        // Complex Search (Requires populating first or using aggregation, but we'll approximate with ID search or regex on populated paths after fetch, 
        // OR better: use $lookup for true server-side search. For now, we'll search by orderId or driver name/email/phone if possible)
        // Note: MongoDB find doesn't search across populated fields. 
        // For a full implementation, we use aggregation.

        let assignments = await Assignment.find(query)
            .populate({
                path: 'order',
                match: search ? {
                    $or: [
                        { orderId: new RegExp(search as string, 'i') },
                        { customer: new RegExp(search as string, 'i') }
                    ]
                } : {}
            })
            .populate('driver', 'name email phone image')
            .populate('vehicle', 'model licensePlate type')
            .sort({ assignedAt: -1 });

        // If search was active, filter out null orders (failed match)
        if (search) {
            assignments = assignments.filter((a: any) => a.order !== null);
        }

        const total = assignments.length;
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedAssignments = assignments.slice(skip, skip + Number(limit));

        res.json({
            data: paginatedAssignments,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update Assignment Verification
// @route   PATCH /api/logistics/assignments/:id/verify
router.patch('/assignments/:id/verify', async (req, res) => {
    try {
        const { verified } = req.body;
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { verificationStatus: verified },
            { new: true }
        );
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update Assignment Status
// @route   PUT /api/logistics/assignments/:id/status
router.put('/assignments/:id/status', async (req, res) => {
    try {
        const { status, note, location } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        assignment.status = status;
        if (status === 'Delivered') {
            assignment.completedAt = new Date();
        }

        // Add to timeline
        assignment.timeline.push({
            status,
            timestamp: new Date(),
            note,
            location
        });

        await assignment.save();

        // Sync with Order
        await Order.findByIdAndUpdate(assignment.order, { status });

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
