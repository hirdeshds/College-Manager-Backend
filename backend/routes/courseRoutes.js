const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// All users can view courses, only admin can manage
router.get('/', courseController.getAllCourses);
router.post('/', authorizeRole(['admin']), courseController.createCourse);
router.put('/:id', authorizeRole(['admin']), courseController.updateCourse);
router.delete('/:id', authorizeRole(['admin']), courseController.deleteCourse);

module.exports = router;
