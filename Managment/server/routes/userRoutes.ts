import express from 'express';
import User from '../models/User';
import { emailService } from '../services/emailService';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
router.get('/', async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};

        if (role) {
            query = { role };
        }

        // Don't return password in list
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a new user
// @route   POST /api/users
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            name,
            email,
            password: password || '', // In production, hash password with bcrypt
            role,
            status: status || 'Active'
        });
        const createdUser = await user.save();

        // Send registration success email
        await emailService.sendRegistrationEmail({ name: createdUser.name, email: createdUser.email });

        // Don't return password
        const userResponse = {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            status: createdUser.status,
            lastLogin: createdUser.lastLogin
        };

        res.status(201).json(userResponse);
    } catch (error: any) {
        console.error('User creation error:', error);
        res.status(400).json({ message: error.message || 'Invalid user data' });
    }
});

// @desc    Update a user
// @route   PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.status = req.body.status || user.status;

            // Only update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Don't return password
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                lastLogin: updatedUser.lastLogin
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;

