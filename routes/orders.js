const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ammys_fashion_hub_secret_key_2024';

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please login.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, transactionId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }
    const orderId = 'AMMY' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);

    const order = new Order({
      orderId,
      user: req.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      transactionId: transactionId || '',
      status: 'Completed'
    });
    await order.save();

    // Also push to user's order history
    const user = await User.findById(req.userId);
    if (user) {
      user.orders.push({
        orderId,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        transactionId: transactionId || '',
        status: 'Completed',
        createdAt: new Date()
      });
      await user.save();
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId,
      paymentMethod: paymentMethod || 'COD',
      transactionId: transactionId || '',
      status: 'Completed',
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error placing order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

module.exports = router;