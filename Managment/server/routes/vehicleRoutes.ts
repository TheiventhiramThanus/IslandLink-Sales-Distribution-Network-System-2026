import express from 'express';
import Vehicle from '../models/Vehicle';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads/vehicles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `vehicle-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed'));
    }
});

// @desc    Get all vehicles with filtering
// @route   GET /api/vehicles
router.get('/', async (req, res) => {
    try {
        const { center, status, search } = req.query;
        let query: any = {};

        if (center && center !== 'All') {
            query.distributionCenter = center;
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { vehicleId: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { licensePlate: { $regex: search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a new vehicle
// @route   POST /api/vehicles
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { vehicleId, model, licensePlate, type, status, distributionCenter } = req.body;

        // Check if vehicleId or licensePlate already exists
        const existingVehicleId = await Vehicle.findOne({ vehicleId });
        if (existingVehicleId) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Vehicle ID already exists' });
        }

        const existingPlate = await Vehicle.findOne({ licensePlate });
        if (existingPlate) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'License plate already exists' });
        }

        const vehicle = new Vehicle({
            vehicleId,
            model,
            licensePlate,
            type,
            status,
            distributionCenter,
            vehiclePhoto: req.file ? `/uploads/vehicles/${req.file.filename}` : ''
        });

        const savedVehicle = await vehicle.save();
        res.status(201).json(savedVehicle);
    } catch (error: any) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const updateData = { ...req.body };
        if (req.file) {
            // Delete old photo if exists
            if (vehicle.vehiclePhoto) {
                const oldPath = path.join('public', vehicle.vehiclePhoto);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.vehiclePhoto = `/uploads/vehicles/${req.file.filename}`;
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json(updatedVehicle);
    } catch (error: any) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Delete photo if exists
        if (vehicle.vehiclePhoto) {
            const photoPath = path.join('public', vehicle.vehiclePhoto);
            if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
        }

        await Vehicle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vehicle removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
