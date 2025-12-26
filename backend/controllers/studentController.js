const pool = require('../config/db');

const getAllStudents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { status, course_id } = req.body;
  try {
    await pool.query('UPDATE students SET status = ?, course_id = ? WHERE id = ?', [status, course_id, id]);
    const [updated] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const [student] = await pool.query('SELECT user_id FROM students WHERE id = ?', [id]);
    if (student[0]) {
      await pool.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);
      res.json({ message: "Student deleted" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};

module.exports = { getAllStudents, updateStudent, deleteStudent };
