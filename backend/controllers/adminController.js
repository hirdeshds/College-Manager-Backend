const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const bcrypt = require('bcrypt');

const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findPending();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending teachers" });
  }
};

const approveTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await Teacher.updateStatus(id, 'active');
    res.json({ message: "Teacher approved" });
  } catch (err) {
    res.status(500).json({ message: "Error approving teacher" });
  }
};

const rejectTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await Teacher.updateStatus(id, 'rejected');
    res.json({ message: "Teacher rejected" });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting teacher" });
  }
};

const createStudent = async (req, res) => {
  const { name, email, password, studentId, courseId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(name, email, hashedPassword, 'student');
    await Student.create(user.id, studentId, courseId);
    res.status(201).json({ message: "Student created" });
  } catch (err) {
    res.status(400).json({ message: "Error creating student" });
  }
};

module.exports = { getPendingTeachers, approveTeacher, rejectTeacher, createStudent };
