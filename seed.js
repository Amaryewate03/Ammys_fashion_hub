require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ammys_fashion_hub';

const products = [
  {
    title: "Classic Oxford Cotton Shirt",
    description: "Premium cotton oxford shirt with a refined collar. Perfect for formal and smart-casual looks.",
    price: 1499,
    category: "Shirts",
    gender: "Men",
    style: "Formals",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop",
    rating: 4.6,
    stock: 40,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Light Blue", "Navy"],
    featured: true
  },
  {
    title: "Slim Fit Casual Linen Shirt",
    description: "Breathable pure linen shirt ideal for summer days and relaxed evenings.",
    price: 1299,
    category: "Shirts",
    gender: "Men",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&h=600&fit=crop",
    rating: 4.4,
    stock: 35,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Olive", "White"],
    featured: false
  },
  {
    title: "Essential Crew Neck T-Shirt",
    description: "Soft premium cotton crew neck tee with a modern slim fit.",
    price: 699,
    category: "T-Shirts",
    gender: "Men",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    rating: 4.5,
    stock: 80,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey", "Navy"],
    featured: true
  },
  {
    title: "Graphic Streetwear Tee",
    description: "Bold graphic print streetwear t-shirt for everyday urban style.",
    price: 899,
    category: "T-Shirts",
    gender: "Men",
    style: "Streetwear",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop",
    rating: 4.3,
    stock: 55,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    featured: false
  },
  {
    title: "Tailored Chino Pants",
    description: "Smart-casual chino pants with a modern tapered fit and stretch comfort.",
    price: 1799,
    category: "Pants",
    gender: "Men",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=600&fit=crop",
    rating: 4.7,
    stock: 45,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Khaki", "Navy", "Olive", "Black"],
    featured: true
  },
  {
    title: "Performance Joggers",
    description: "Lightweight stretch joggers with tapered leg and zip pockets. Perfect for active days.",
    price: 1399,
    category: "Joggers",
    gender: "Men",
    style: "Streetwear",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=600&fit=crop",
    rating: 4.5,
    stock: 50,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Charcoal", "Navy"],
    featured: false
  },
  {
    title: "Premium Fleece Hoodie",
    description: "Soft fleece-lined hoodie with kangaroo pocket and adjustable drawstring hood.",
    price: 1999,
    category: "Hoodies",
    gender: "Men",
    style: "Streetwear",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=600&fit=crop",
    rating: 4.8,
    stock: 30,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Maroon"],
    featured: true
  },
  {
    title: "Classic Two-Piece Suit",
    description: "Elegant formal suit in premium fabric. Ideal for weddings and business occasions.",
    price: 5999,
    category: "Suits",
    gender: "Men",
    style: "Formals",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
    rating: 4.9,
    stock: 20,
    sizes: ["38", "40", "42", "44"],
    colors: ["Navy", "Charcoal", "Black"],
    featured: true
  },
  {
    title: "Floral Summer Dress",
    description: "Lightweight floral print dress with a flattering silhouette for warm days.",
    price: 1899,
    category: "Dresses",
    gender: "Women",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d617b0?w=500&h=600&fit=crop",
    rating: 4.6,
    stock: 35,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Multi", "Blue Floral"],
    featured: true
  },
  {
    title: "Elegant Evening Dress",
    description: "Sophisticated midi dress perfect for evening events and celebrations.",
    price: 2999,
    category: "Dresses",
    gender: "Women",
    style: "Formals",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=600&fit=crop",
    rating: 4.8,
    stock: 25,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Burgundy", "Navy"],
    featured: true
  },
  {
    title: "Relaxed Fit Women's Shirt",
    description: "Soft cotton shirt with a modern relaxed cut for effortless style.",
    price: 1199,
    category: "Shirts",
    gender: "Women",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=600&fit=crop",
    rating: 4.4,
    stock: 40,
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Pink", "Sky Blue"],
    featured: false
  },
  {
    title: "Premium Women's Hoodie",
    description: "Cozy oversized hoodie in soft fleece for everyday comfort.",
    price: 1799,
    category: "Hoodies",
    gender: "Women",
    style: "Streetwear",
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&h=600&fit=crop",
    rating: 4.7,
    stock: 30,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Black", "Lavender"],
    featured: false
  },
  {
    title: "High-Waist Tailored Pants",
    description: "Flattering high-waist pants with a clean tailored finish.",
    price: 1699,
    category: "Pants",
    gender: "Women",
    style: "Formals",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=600&fit=crop",
    rating: 4.5,
    stock: 35,
    sizes: ["26", "28", "30", "32", "34"],
    colors: ["Black", "Beige", "Navy"],
    featured: false
  },
  {
    title: "Traditional Embroidered Kurti",
    description: "Beautiful ethnic kurti with intricate embroidery. Perfect for festive occasions.",
    price: 1599,
    category: "Ethnic Wear",
    gender: "Women",
    style: "Traditional/Ethnic",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d85c85?w=500&h=600&fit=crop",
    rating: 4.7,
    stock: 40,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Maroon", "Teal", "Mustard"],
    featured: true
  },
  {
    title: "Festive Anarkali Suit Set",
    description: "Graceful Anarkali suit set with matching dupatta for celebrations and functions.",
    price: 3499,
    category: "Ethnic Wear",
    gender: "Women",
    style: "Traditional/Ethnic",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&h=600&fit=crop",
    rating: 4.9,
    stock: 20,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Royal Blue", "Pink", "Green"],
    featured: true
  },
  {
    title: "Kids Graphic T-Shirt",
    description: "Fun and colorful graphic tee for active kids. Soft cotton, easy care.",
    price: 499,
    category: "Kids Wear",
    gender: "Kids",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&h=600&fit=crop",
    rating: 4.5,
    stock: 60,
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: ["Blue", "Red", "Yellow"],
    featured: false
  },
  {
    title: "Kids Denim Joggers",
    description: "Comfortable denim-style joggers for kids with elastic waist and cuffs.",
    price: 799,
    category: "Kids Wear",
    gender: "Kids",
    style: "Casuals",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad1?w=500&h=600&fit=crop",
    rating: 4.4,
    stock: 45,
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Blue", "Black"],
    featured: false
  },
  {
    title: "Kids Hooded Sweatshirt",
    description: "Warm and soft hooded sweatshirt for cooler days. Fun colors for kids.",
    price: 899,
    category: "Kids Wear",
    gender: "Kids",
    style: "Streetwear",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500&h=600&fit=crop",
    rating: 4.6,
    stock: 40,
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    colors: ["Navy", "Red", "Grey"],
    featured: true
  },
  {
    title: "Boys Formal Shirt",
    description: "Crisp formal shirt for school events and family occasions.",
    price: 699,
    category: "Kids Wear",
    gender: "Kids",
    style: "Formals",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=600&fit=crop",
    rating: 4.3,
    stock: 35,
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    colors: ["White", "Light Blue"],
    featured: false
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    console.log('Cleared existing products');
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();