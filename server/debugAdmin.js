// debugAdmin.js — run this once with: node debugAdmin.js
// Put it in your server/ folder (same level as server.js) and run it from there.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function run() {
  console.log('--- ENV CHECK ---');
  console.log('MONGO_URI set:', !!process.env.MONGO_URI);
  console.log('ADMIN_EMAIL:', JSON.stringify(process.env.ADMIN_EMAIL));
  console.log('ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to database:', mongoose.connection.name);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    console.log('--- RESULT ---');
    console.log('No user found with email:', email);
    console.log('This means the admin was never created (or created under a different email).');
  } else {
    console.log('--- FOUND USER ---');
    console.log('Stored email:', user.email);
    console.log('Stored role:', user.role);
    console.log('Stored password looks like a bcrypt hash:', user.password.startsWith('$2'));
    console.log('Stored password value:', user.password);

    const match = await bcrypt.compare(process.env.ADMIN_PASSWORD, user.password);
    console.log('--- PASSWORD TEST ---');
    console.log('Does ADMIN_PASSWORD from .env match the stored hash?', match);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});