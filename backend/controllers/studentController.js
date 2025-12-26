const Student = require('../models/Student');

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { status, course_id } = req.body;
  try {
    const updated = await Student.update(id, status, course_id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await Student.delete(id);
    if (success) {
      res.json({ message: "Student deleted" });
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};

module.exports = { getAllStudents, updateStudent, deleteStudent };
