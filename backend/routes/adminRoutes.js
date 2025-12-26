const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRole(['admin']));

router.get('/pending-teachers', adminController.getPendingTeachers);
router.put('/approve-teacher/:id', adminController.approveTeacher);
router.delete('/reject-teacher/:id', adminController.rejectTeacher);
router.post('/create-student', adminController.createStudent);

module.exports = router;
