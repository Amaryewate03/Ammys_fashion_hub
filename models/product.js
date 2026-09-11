const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Shirts', 'T-Shirts', 'Pants', 'Joggers', 'Hoodies', 'Jackets', 'Dresses', 'Ethnic Wear', 'Suits', 'Kids Wear']
  },
  gender: {
    type: String,
    required: true,
    enum: ['Men', 'Women', 'Kids', 'Unisex']
  },
  style: {
    type: String,
    required: true,
    enum: ['Traditional/Ethnic', 'Casuals', 'Formals', 'Streetwear']
  },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  stock: { type: Number, default: 50, min: 0 },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);