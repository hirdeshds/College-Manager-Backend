const Course = require('../models/Course');

const createCourse = async (req, res) => {
  const { name, code, duration, description } = req.body;
  try {
    const course = await Course.create(name, code, duration, description);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: "Error creating course or code exists" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, code, duration, description } = req.body;
  try {
    const updated = await Course.update(id, name, code, duration, description);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed" });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await Course.delete(id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};

module.exports = { createCourse, getAllCourses, updateCourse, deleteCourse };
