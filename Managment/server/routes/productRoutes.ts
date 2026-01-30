import express from 'express';
import Product from '../models/Product';

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create new product
// @route   POST /api/products
router.post('/', async (req, res) => {
    try {
        const { name, sku, stock, reserved, rdc, location, image, price, category, description } = req.body;

        // Auto-generate SKU if not provided
        const productSku = sku || `ISDN-${Date.now().toString(36).toUpperCase()}`;

        // Calculate available and status
        const available = (stock || 0) - (reserved || 0);
        let status = 'In Stock';
        if (available <= 10) status = 'Critical';
        else if (available <= 50) status = 'Low Stock';

        const product = new Product({
            name,
            sku: productSku,
            stock: stock || 0,
            reserved: reserved || 0,
            available,
            rdc: rdc || 'Colombo RDC',
            location: location || 'WH-A1',
            status,
            image: image || '',
            price: price || 0,
            category: category || 'General',
            description: description || ''
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error: any) {
        console.error('Product creation error:', error);
        res.status(400).json({ message: error.message || 'Invalid product data' });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name ?? product.name;
            product.sku = req.body.sku ?? product.sku;
            product.stock = req.body.stock ?? product.stock;
            product.reserved = req.body.reserved ?? product.reserved;
            product.available = req.body.available ?? product.available;
            product.rdc = req.body.rdc ?? product.rdc;
            product.location = req.body.location ?? product.location;
            product.image = req.body.image ?? product.image;
            product.price = req.body.price ?? product.price;
            product.category = req.body.category ?? product.category;
            product.description = req.body.description ?? product.description;

            // Auto-update status based on availability
            if (product.available <= 10) product.status = 'Critical';
            else if (product.available <= 50) product.status = 'Low Stock';
            else product.status = 'In Stock';

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data' });
    }
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
router.put('/:id/stock', async (req, res) => {
    try {
        const { stock, reserved, available } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.stock = stock ?? product.stock;
            product.reserved = reserved ?? product.reserved;
            product.available = available ?? product.available;

            // Auto-update status based on availability
            if (product.available <= 10) product.status = 'Critical';
            else if (product.available <= 50) product.status = 'Low Stock';
            else product.status = 'In Stock';

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid product data' });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: req.params.id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
