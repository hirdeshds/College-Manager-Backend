const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Teacher = require('../models/Teacher');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role === 'teacher') {
        const teacher = await Teacher.findByUserId(user.id);
        if (teacher?.status !== 'active') {
            return res.status(403).json({ message: "Account is pending approval or inactive" });
        }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const teacherRegister = async (req, res) => {
  const { name, email, password, department } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create(name, email, hashedPassword, 'teacher');
    await Teacher.create(user.id, department, `T${Date.now()}`);
    res.status(201).json({ message: "Teacher registered successfully. Pending approval." });
  } catch (err) {
    res.status(400).json({ message: "Registration failed or email exists" });
  }
};

module.exports = { login, teacherRegister };
