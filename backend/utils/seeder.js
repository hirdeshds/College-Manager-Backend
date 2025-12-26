const User = require('../models/User');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@college.com';
    const existingAdmin = await User.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create('Admin User', adminEmail, hashedPassword, 'admin');
      console.log('Default admin user created successfully.');
    }
  } catch (err) {
    console.error('Error seeding default admin user:', err);
  }
};

module.exports = { seedAdmin };
