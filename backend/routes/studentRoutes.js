const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRole(['admin']));

router.get('/', studentController.getAllStudents);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
