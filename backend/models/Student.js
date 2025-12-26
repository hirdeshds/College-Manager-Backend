const pool = require('../config/db');

const Student = {
  create: async (userId, studentId, courseId) => {
    const [rows] = await pool.query(
      'INSERT INTO students (user_id, student_id, course_id, status) VALUES (?, ?, ?, ?) RETURNING *',
      [userId, studentId, courseId, 'active']
    );
    return rows[0];
  },
  findAll: async () => {
    const [rows] = await pool.query(
      'SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id'
    );
    return rows;
  },
  update: async (id, status, courseId) => {
    const [rows] = await pool.query(
      'UPDATE students SET status = ?, course_id = ? WHERE id = ? RETURNING *',
      [status, courseId, id]
    );
    return rows[0];
  },
  delete: async (id) => {
    const [student] = await pool.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (student[0]) {
      await pool.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);
      return true;
    }
    return false;
  }
};

module.exports = Student;
