const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: "College Management System API" });
});

module.exports = app;
