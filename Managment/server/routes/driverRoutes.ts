import express from 'express';
import User from '../models/User';
import Notification from '../models/Notification';

const router = express.Router();

// ... existing routes ...

// @desc    Get driver notifications
// @route   GET /api/drivers/:id/notifications
router.get('/:id/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.params.id
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/drivers/notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Register a new driver
// @route   POST /api/drivers/register
router.post('/register', async (req, res) => {
    try {
        const {
            name, email, password, phone, address,
            vehicleType, vehicleNumber, licenseNumber, nicNumber,
            vehiclePhoto, licensePhoto, nicPhoto, driverPhoto,
            distributionCenter
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Driver with this email already exists' });
        }

        // Create new driver with Pending status
        const driver = new User({
            name,
            email,
            password, // In production, hash this
            role: 'driver',
            phone,
            address,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            nicNumber,
            vehiclePhoto, // Base64 strings for demo
            licensePhoto,
            nicPhoto,
            image: driverPhoto, // Map driverPhoto to User.image
            company: distributionCenter, // Distribution center
            status: 'Active',
            approvalStatus: 'Pending'
        });

        await driver.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful. Waiting for admin approval.'
        });
    } catch (error: any) {
        console.error('Driver registration error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Login for drivers
// @route   POST /api/drivers/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'driver' });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid driver credentials' });
        }

        // Approval Check
        if (user.approvalStatus !== 'Approved') {
            const message = user.approvalStatus === 'Pending'
                ? 'Your registration is pending admin approval.'
                : 'Registration rejected.';

            return res.status(403).json({
                success: false,
                message,
                approvalStatus: user.approvalStatus,
                rejectionReason: user.rejectionReason
            });
        }

        // Demo check for password
        if (user.password && user.password !== '' && user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        res.json({
            success: true,
            driver: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                vehicleNumber: user.vehicleNumber
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all drivers with filtering
// @route   GET /api/drivers
router.get('/', async (req, res) => {
    try {
        const { approvalStatus, activeStatus, center, search } = req.query;
        let query: any = { role: 'driver' };

        if (approvalStatus && approvalStatus !== 'All') {
            query.approvalStatus = approvalStatus;
        }

        if (activeStatus && activeStatus !== 'All') {
            query.status = activeStatus;
        }

        if (center && center !== 'All') {
            query.company = center;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { vehicleNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await User.find(query).sort({ createdAt: -1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update driver approval status
// @route   PATCH /api/drivers/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, note, adminId } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const driver = await User.findById(req.params.id);
        if (!driver || driver.role !== 'driver') {
            return res.status(404).json({ message: 'Driver not found' });
        }

        driver.approvalStatus = status;
        driver.rejectionReason = note;
        driver.approvedBy = adminId;
        driver.approvedAt = new Date();

        await driver.save();

        res.json({
            success: true,
            message: `Driver ${status.toLowerCase()} successfully`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
