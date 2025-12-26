const pool = require('../config/db');

const Course = {
  create: async (name, code, duration, description) => {
    const [rows] = await pool.query(
      'INSERT INTO courses (name, code, duration, description) VALUES (?, ?, ?, ?) RETURNING *',
      [name, code, duration, description]
    );
    return rows[0];
  },
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM courses');
    return rows;
  },
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0];
  },
  update: async (id, name, code, duration, description) => {
    const [rows] = await pool.query(
      'UPDATE courses SET name = ?, code = ?, duration = ?, description = ? WHERE id = ? RETURNING *',
      [name, code, duration, description, id]
    );
    return rows[0];
  },
  delete: async (id) => {
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Course;
