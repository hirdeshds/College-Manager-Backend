const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "College Management System Backend is running",
    documentation: "/api-docs (placeholder)",
    status: "ready"
  });
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);

module.exports = app;
