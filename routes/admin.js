const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ammys_fashion_hub_secret_key_2024';
const ORDER_STATUSES = ['Pending', 'Completed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function createAdminToken(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

async function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Admin login required' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired admin session' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid admin email or password' });
    }

    res.json({
      token: createAdminToken(user),
      admin: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Admin login failed' });
  }
});

router.get('/me', adminAuth, (req, res) => {
  res.json({ admin: req.admin });
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [products, users, orders, enquiries, revenue] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Enquiry.countDocuments({ status: 'New' }),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);
    res.json({ products, users, orders, enquiries, revenue: revenue[0] ? revenue[0].total : 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load dashboard stats' });
  }
});

router.get('/products', adminAuth, async (req, res) => {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: 'Could not load products' });
  }
});

function productFields(body) {
  return {
    title: body.title,
    description: body.description,
    price: Number(body.price),
    category: body.category,
    gender: body.gender,
    style: body.style,
    image: body.image,
    rating: Number(body.rating || 4),
    stock: Number(body.stock || 0),
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    colors: Array.isArray(body.colors) ? body.colors : [],
    featured: Boolean(body.featured)
  };
}

router.post('/products', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(productFields(req.body));
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not create product' });
  }
});

router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, productFields(req.body), { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update product' });
  }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete product' });
  }
});

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders' });
  }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid order status' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await User.updateOne({ _id: order.user, 'orders.orderId': order.orderId }, { $set: { 'orders.$.status': status } });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Could not update order status' });
  }
});

router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { totalAmount, paymentMethod, transactionId, status, shippingAddress } = req.body;
    if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid order status' });
    if (!['UPI', 'Card', 'NetBanking', 'COD'].includes(paymentMethod)) return res.status(400).json({ message: 'Invalid payment method' });
    const order = await Order.findByIdAndUpdate(req.params.id, {
      totalAmount: Number(totalAmount), paymentMethod, transactionId: transactionId || '', status, shippingAddress
    }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await User.updateOne({ _id: order.user, 'orders.orderId': order.orderId }, { $set: {
      'orders.$.totalAmount': order.totalAmount,
      'orders.$.paymentMethod': order.paymentMethod,
      'orders.$.transactionId': order.transactionId,
      'orders.$.status': order.status,
      'orders.$.shippingAddress': order.shippingAddress
    } });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update order' });
  }
});

router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await User.updateOne({ _id: order.user }, { $pull: { orders: { orderId: order.orderId } } });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete order' });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).select('-password -orders').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Could not load customers' });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const user = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    user.name = name;
    user.email = email;
    user.phone = phone || '';
    if (password) user.password = password;
    await user.save();
    res.json(await User.findById(user._id).select('-password -orders'));
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? 'Email already registered' : err.message || 'Could not update customer' });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    await Order.deleteMany({ user: user._id });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete customer' });
  }
});

router.get('/enquiries', adminAuth, async (req, res) => {
  try {
    res.json(await Enquiry.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ message: 'Could not load enquiries' });
  }
});

router.put('/enquiries/:id', adminAuth, async (req, res) => {
  try {
    const { name, email, message, status } = req.body;
    if (!['New', 'In Progress', 'Resolved'].includes(status)) return res.status(400).json({ message: 'Invalid enquiry status' });
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { name, email, message, status, updatedAt: new Date() }, { new: true, runValidators: true });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update enquiry' });
  }
});

router.delete('/enquiries/:id', adminAuth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete enquiry' });
  }
});

module.exports = router;
