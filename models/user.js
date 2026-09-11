const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: String,
  price: Number,
  quantity: Number,
  image: String,
  size: String,
  color: String
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'NetBanking', 'COD'], default: 'COD' },
  status: { type: String, enum: ['Pending', 'Completed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  transactionId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  orders: [orderSchema],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.password.startsWith('$2')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);