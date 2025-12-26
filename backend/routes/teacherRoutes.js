const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', teacherController.getAllTeachers);

module.exports = router;
