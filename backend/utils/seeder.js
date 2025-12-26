const pool = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * Ensures a default admin user exists in the database.
 * Email: admin@college.com
 * Password: admin123
 */
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@college.com';
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
    
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      // Query uses Postgres-style RETURNING id for compatibility with the Replit environment's DB
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', adminEmail, hashedPassword, 'admin']
      );
      console.log('Default admin user created successfully.');
    }
  } catch (err) {
    console.error('Error seeding default admin user:', err);
  }
};

module.exports = { seedAdmin };
