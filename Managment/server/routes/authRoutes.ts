import express from 'express';
import User from '../models/User';
import { emailService } from '../services/emailService';

const router = express.Router();

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is a driver and approved
        if (user.role === 'driver' && user.approvalStatus !== 'Approved') {
            const statusMsg = user.approvalStatus === 'Pending'
                ? 'Your registration is pending admin approval. Please wait.'
                : 'Your registration was rejected. Please contact support.';
            return res.status(403).json({ message: statusMsg });
        }

        // Check password (in production, use bcrypt.compare)
        // For demo, we check if password matches or if password is empty (allow login)
        if (user.password && user.password !== '' && user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Send login notification email
        try {
            await emailService.sendLoginNotificationEmail(
                {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                {
                    timestamp: new Date(),
                    ip: req.ip || req.connection?.remoteAddress,
                    device: req.headers['user-agent']
                }
            );
        } catch (emailError) {
            console.error('Failed to send login notification:', emailError);
            // Don't fail login if email fails
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user with password
        const user = new User({
            name,
            email,
            password: password || '',
            role: role || 'sales',
            status: 'Active',
            lastLogin: new Date()
        });

        const createdUser = await user.save();

        // Send role-specific registration email
        try {
            if (createdUser.role === 'driver') {
                await emailService.sendDriverRegistrationEmail({
                    name: createdUser.name,
                    email: createdUser.email
                });
            } else if (createdUser.role === 'customer') {
                await emailService.sendRegistrationEmail({
                    name: createdUser.name,
                    email: createdUser.email
                });
            } else {
                // For other roles (manager, logistics, sales, admin)
                await emailService.sendRegistrationEmail({
                    name: createdUser.name,
                    email: createdUser.email
                });
            }
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            user: {
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                status: createdUser.status
            }
        });
    } catch (error: any) {
        console.error('Registration error details:', {
            message: error.message,
            stack: error.stack,
            body: { name: req.body.name, email: req.body.email, role: req.body.role }
        });
        res.status(400).json({ message: error.message || 'Invalid user data' });
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        // For demo, return the first active user
        // In production, use JWT token to identify user
        const user = await User.findOne({ status: 'Active' });

        if (user) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    company: user.company,
                    phone: user.phone,
                    address: user.address
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', async (req, res) => {
    try {
        const { id, name, email, company, phone, address } = req.body;

        // In production, use req.user.id from JWT
        // For demo, we'll find the active user
        const targetId = id || (await User.findOne({ status: 'Active' }))?._id;

        if (!targetId) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(targetId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (company !== undefined) user.company = company;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;

        const updatedUser = await user.save();

        res.json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                company: updatedUser.company,
                phone: updatedUser.phone,
                address: updatedUser.address
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Get all users for login selection
// @route   GET /api/auth/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ status: 'Active' }).select('name email role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
