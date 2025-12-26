const pool = require('../config/db');

const Teacher = {
  create: async (userId, department, teacherId) => {
    const [rows] = await pool.query(
      'INSERT INTO teachers (user_id, department, teacher_id, status) VALUES (?, ?, ?, ?) RETURNING *',
      [userId, department, teacherId, 'pending']
    );
    return rows[0];
  },
  findByUserId: async (userId) => {
    const [rows] = await pool.query('SELECT * FROM teachers WHERE user_id = ?', [userId]);
    return rows[0];
  },
  findPending: async () => {
    const [rows] = await pool.query(
      'SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.status = ?',
      ['pending']
    );
    return rows;
  },
  findAll: async () => {
    const [rows] = await pool.query(
      'SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id'
    );
    return rows;
  },
  updateStatus: async (id, status) => {
    const [rows] = await pool.query(
      'UPDATE teachers SET status = ? WHERE id = ? RETURNING *',
      [status, id]
    );
    return rows[0];
  }
};

module.exports = Teacher;
