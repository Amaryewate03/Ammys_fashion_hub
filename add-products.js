require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ammys_fashion_hub';

const products = [
  {
    title: 'Sunset Puffer Jacket', description: 'Warm quilted puffer jacket in a bold sunset yellow.', price: 2499,
    category: 'Jackets', gender: 'Men', style: 'Streetwear', image: 'https://images.pexels.com/photos/14887834/pexels-photo-14887834.jpeg', rating: 4.6, stock: 30,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Yellow'], featured: true
  },
  {
    title: 'Essential White T-Shirt', description: 'Clean everyday cotton t-shirt with a relaxed fit.', price: 699,
    category: 'T-Shirts', gender: 'Men', style: 'Casuals', image: 'https://images.pexels.com/photos/8217533/pexels-photo-8217533.jpeg', rating: 4.5, stock: 60,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White'], featured: false
  },
  {
    title: 'Graphic Printed Casual Shirt', description: 'Statement printed shirt for expressive street style.', price: 1399,
    category: 'Shirts', gender: 'Men', style: 'Streetwear', image: 'https://images.pexels.com/photos/19528646/pexels-photo-19528646.jpeg', rating: 4.4, stock: 35,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Multi'], featured: true
  },
  {
    title: 'Urban Utility Jacket', description: 'Structured utility jacket with a confident all-black finish.', price: 2199,
    category: 'Jackets', gender: 'Men', style: 'Streetwear', image: 'https://images.pexels.com/photos/12341579/pexels-photo-12341579.jpeg', rating: 4.5, stock: 28,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'], featured: false
  },
  {
    title: 'Red Bomber Jacket', description: 'Bright lightweight bomber jacket with ribbed trims.', price: 1999,
    category: 'Jackets', gender: 'Men', style: 'Streetwear', image: 'https://images.pexels.com/photos/16069733/pexels-photo-16069733.jpeg', rating: 4.7, stock: 32,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Red'], featured: true
  },
  {
    title: 'Rose Tailored Blazer', description: 'Polished rose blazer that lifts smart-casual outfits.', price: 2899,
    category: 'Suits', gender: 'Men', style: 'Formals', image: 'https://images.pexels.com/photos/16069735/pexels-photo-16069735.jpeg', rating: 4.6, stock: 20,
    sizes: ['38', '40', '42', '44'], colors: ['Rose Pink'], featured: false
  },
  {
    title: 'Classic Black Sherwani', description: 'Elegant black sherwani with refined gold button detailing.', price: 4499,
    category: 'Ethnic Wear', gender: 'Men', style: 'Traditional/Ethnic', image: 'https://images.pexels.com/photos/6687174/pexels-photo-6687174.jpeg', rating: 4.8, stock: 18,
    sizes: ['38', '40', '42', '44'], colors: ['Black'], featured: true
  },
  {
    title: 'Heritage Printed Waistcoat', description: 'Colourful printed waistcoat for festive and occasion dressing.', price: 1799,
    category: 'Ethnic Wear', gender: 'Men', style: 'Traditional/Ethnic', image: 'https://images.pexels.com/photos/14847117/pexels-photo-14847117.jpeg', rating: 4.5, stock: 24,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Multi'], featured: false
  },
  {
    title: 'Classic Kurta Collection', description: 'Comfortable long kurtas in earthy tones for everyday ethnic style.', price: 1599,
    category: 'Ethnic Wear', gender: 'Men', style: 'Traditional/Ethnic', image: 'https://images.pexels.com/photos/8802622/pexels-photo-8802622.jpeg', rating: 4.6, stock: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Brown', 'Ivory'], featured: true
  },
  {
    title: 'Relaxed Overshirt Jacket', description: 'Minimal overshirt jacket with practical front pockets.', price: 1899,
    category: 'Jackets', gender: 'Unisex', style: 'Casuals', image: 'https://images.pexels.com/photos/6616673/pexels-photo-6616673.jpeg', rating: 4.4, stock: 26,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Charcoal'], featured: false
  },
  {
    title: 'Embroidered Kurta Pajama Set', description: 'Festive kurta pajama set with delicate embroidery and a rich finish.', price: 3299,
    category: 'Ethnic Wear', gender: 'Men', style: 'Traditional/Ethnic', image: 'https://images.pexels.com/photos/2060241/pexels-photo-2060241.jpeg', rating: 4.8, stock: 16,
    sizes: ['38', '40', '42', '44'], colors: ['Gold', 'Black'], featured: true
  },
  {
    title: 'Contemporary Ethnic Long Jacket', description: 'Layered ethnic jacket inspired by modern festive dressing.', price: 2699,
    category: 'Ethnic Wear', gender: 'Men', style: 'Traditional/Ethnic', image: 'https://images.pexels.com/photos/29427497/pexels-photo-29427497.jpeg', rating: 4.7, stock: 22,
    sizes: ['S', 'M', 'L', 'XL'], colors: ['Maroon', 'Black', 'Navy'], featured: false
  }
];

async function addProducts() {
  await mongoose.connect(MONGO_URI);
  let added = 0;
  for (const product of products) {
    const result = await Product.updateOne({ image: product.image }, { $setOnInsert: product }, { upsert: true });
    if (result.upsertedCount) added += 1;
  }
  console.log(`Added ${added} new products; ${products.length - added} already existed.`);
  await mongoose.disconnect();
}

addProducts().catch(error => {
  console.error('Could not add products:', error.message);
  process.exitCode = 1;
});