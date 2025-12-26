# Database Integration Documentation (MySQL)

This project uses MySQL for data persistence. Below is the complete schema and key queries used in the application.

## 1. Schema Definition (SQL)

```sql
-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE,
  course_id INT REFERENCES courses(id),
  enrollment_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Teachers Table
CREATE TABLE teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  teacher_id VARCHAR(50) UNIQUE,
  department VARCHAR(100) NOT NULL,
  join_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('active', 'inactive', 'pending', 'rejected') DEFAULT 'pending'
);

-- Courses Table
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  duration VARCHAR(50) NOT NULL,
  description TEXT
);

-- Subjects Table
CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  course_id INT REFERENCES courses(id),
  teacher_id INT REFERENCES teachers(id),
  credits INT NOT NULL
);
```

## 2. Key SQL Queries Used

### Authentication
- **Find User by Email**:
  `SELECT * FROM users WHERE email = ?`

### Admin Operations
- **Get Pending Teachers**:
  `SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.status = 'pending'`
- **Approve Teacher**:
  `UPDATE teachers SET status = 'active' WHERE id = ?`
- **Reject Teacher**:
  `UPDATE teachers SET status = 'rejected' WHERE id = ?`

### Student Management
- **Create Student (User part)**:
  `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')`
- **Create Student (Profile part)**:
  `INSERT INTO students (user_id, student_id, course_id) VALUES (?, ?, ?)`
- **List All Students**:
  `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id`

### Teacher Management
- **List All Teachers**:
  `SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id`
- **Check Teacher Status**:
  `SELECT status FROM teachers WHERE user_id = ?`

## 3. Implementation Details
- **Password Security**: All passwords are hashed using `bcrypt` (10 rounds) before insertion.
- **Relational Integrity**: `ON DELETE CASCADE` is used on user-profile relationships to ensure data consistency when a user account is removed.
- **Status-based Login**: The application explicitly checks the `teachers.status` during the login flow for teacher roles.
