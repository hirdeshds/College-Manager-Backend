const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes will be imported here
// const authRoutes = require('./routes/auth');
// app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: "College Management System API" });
});

module.exports = app;
