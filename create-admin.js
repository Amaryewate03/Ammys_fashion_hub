require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const [, , emailArg, passwordArg, ...nameParts] = process.argv;
const email = emailArg && emailArg.toLowerCase();
const password = passwordArg;
const name = nameParts.join(' ') || 'AMMY Admin';
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ammys_fashion_hub';

if (!email || !password || password.length < 6) {
  console.error('Usage: node create-admin.js admin@example.com password "Admin Name"');
  process.exit(1);
}

async function createAdmin() {
  try {
    await mongoose.connect(mongoUri);
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.name = name;
      existing.password = password;
      await existing.save();
      console.log(`Admin access updated for ${email}`);
    } else {
      await User.create({ name, email, password, role: 'admin' });
      console.log(`Admin created for ${email}`);
    }
  } catch (err) {
    console.error('Could not create admin:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
