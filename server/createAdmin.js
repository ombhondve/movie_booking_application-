const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env');
      return;
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      console.log('Admin email:', existingAdmin.email);
      console.log('Admin role:', existingAdmin.role);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: 'Admin',
      email: email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully!');
    console.log('Admin email:', admin.email);
    console.log('Admin role:', admin.role);

  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
}

module.exports = createAdmin;