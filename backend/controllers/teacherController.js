const pool = require('../config/db');

const getAllTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

module.exports = { getAllTeachers };
