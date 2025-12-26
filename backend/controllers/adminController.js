const bcrypt = require('bcrypt');
const pool = require('../config/db');

const getPendingTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.status = ?',
      ['pending']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending teachers" });
  }
};

const approveTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE teachers SET status = ? WHERE id = ?', ['active', id]);
    res.json({ message: "Teacher approved" });
  } catch (err) {
    res.status(500).json({ message: "Error approving teacher" });
  }
};

const rejectTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE teachers SET status = ? WHERE id = ?', ['rejected', id]);
    res.json({ message: "Teacher rejected" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting teacher" });
  }
};

const createStudent = async (req, res) => {
  const { name, email, password, studentId, courseId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id',
      [name, email, hashedPassword, 'student']
    );
    const userId = rows[0].id;
    await pool.query(
      'INSERT INTO students (user_id, student_id, course_id, status) VALUES (?, ?, ?, ?)',
      [userId, studentId, courseId, 'active']
    );
    res.status(201).json({ message: "Student created" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating student" });
  }
};

module.exports = { getPendingTeachers, approveTeacher, rejectTeacher, createStudent };
