const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role === 'teacher') {
        const [teachers] = await pool.query('SELECT status FROM teachers WHERE user_id = ?', [user.id]);
        if (teachers[0]?.status !== 'active') {
            return res.status(403).json({ message: "Account is pending approval or inactive" });
        }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const teacherRegister = async (req, res) => {
  const { name, email, password, department } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    // Use Postgres RETURNING id instead of insertId
    const [rows] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id', [name, email, hashedPassword, 'teacher']);
    const userId = rows[0].id;

    await pool.query('INSERT INTO teachers (user_id, department, status) VALUES (?, ?, ?)', [userId, department, 'pending']);
    res.status(201).json({ message: "Teacher registered successfully. Pending approval." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Registration failed or email exists" });
  }
};

module.exports = { login, teacherRegister };
