import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerTeacherSchema, createStudentSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_dev_only";
const SALT_ROUNDS = 10;

// Middleware for checking JWT and Roles
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    (req as any).user = user;
    next();
  });
};

const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Enable CORS
  app.use(cors());

  // Root route for verification
  app.get("/", (req, res) => {
    res.json({ 
      message: "College Management System Backend is running",
      documentation: "/api-docs (placeholder)",
      status: "ready"
    });
  });
  
  // Seed Admin User
  const ensureAdmin = async () => {
    try {
      const adminEmail = "admin@college.com";
      const existingAdmin = await storage.getUserByEmail(adminEmail);
      if (!existingAdmin) {
        console.log("Creating default admin user...");
        const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
        await storage.createUser({
          name: "Admin User",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        });
        console.log("Default admin created.");
      }
    } catch (err) {
      console.error("Error seeding admin:", err);
    }
  };
  
  // Call immediately (async)
  ensureAdmin();

  // --- AUTH ROUTES ---

  app.post("/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.role === 'teacher') {
        const teacher = await storage.getTeacherByUserId(user.id);
        if (teacher && teacher.status !== 'active') {
          return res.status(403).json({ message: "Account is pending approval or inactive" });
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/auth/teacher-register", async (req, res) => {
    try {
      const data = registerTeacherSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
      
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "teacher"
      });

      await storage.createTeacher(user.id, {
        department: data.department,
        teacherId: `T${Date.now()}` 
      });

      res.status(201).json({ message: "Teacher registered successfully. Pending approval." });
    } catch (e) {
      console.error("Registration error:", e);
      res.status(400).json({ message: "Validation failed" });
    }
  });

  // --- ADMIN ROUTES ---

  app.get("/admin/pending-teachers", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const teachers = await storage.getPendingTeachers();
      res.json(teachers);
    } catch (e) {
      res.status(500).json({ message: "Error fetching pending teachers" });
    }
  });

  app.put("/admin/approve-teacher/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      if (isNaN(teacherId)) return res.status(400).json({ message: "Invalid ID" });
      
      await storage.updateTeacherStatus(teacherId, "active");
      res.json({ message: "Teacher approved successfully" });
    } catch (e) {
      res.status(500).json({ message: "Error approving teacher" });
    }
  });

  app.delete("/admin/reject-teacher/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      if (isNaN(teacherId)) return res.status(400).json({ message: "Invalid ID" });
      
      await storage.updateTeacherStatus(teacherId, "rejected");
      res.json({ message: "Teacher rejected" });
    } catch (e) {
      res.status(500).json({ message: "Error rejecting teacher" });
    }
  });

  app.post("/admin/create-student", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const data = createStudentSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "student"
      });

      const student = await storage.createStudent(user.id, {
        studentId: data.studentId,
        courseId: data.courseId
      });

      res.status(201).json({ message: "Student created successfully", student });
    } catch (e) {
      res.status(400).json({ message: "Validation failed or invalid data" });
    }
  });

  // --- STUDENT ROUTES ---

  app.get("/students", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (e) {
      res.status(500).json({ message: "Error fetching students" });
    }
  });

  app.put("/students/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const updated = await storage.updateStudent(id, req.body);
      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete("/students/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteStudent(id);
      res.json({ message: "Student deleted" });
    } catch (e) {
      res.status(500).json({ message: "Deletion failed" });
    }
  });

  // --- TEACHER ROUTES ---

  app.get("/teachers", authenticateToken, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (e) {
      res.status(500).json({ message: "Error fetching teachers" });
    }
  });

  return httpServer;
}
