const pool = require('../config/db');

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@college.com';
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    if (rows.length === 0) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Default admin user created');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};

module.exports = { seedAdmin };
