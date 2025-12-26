import { pgTable, text, serial, integer, boolean, timestamp, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["admin", "teacher", "student"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "pending", "rejected"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);
export const examTypeEnum = pgEnum("exam_type", ["midterm", "final", "quiz", "assignment"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  duration: text("duration").notNull(),
  description: text("description"),
});

// Students Table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  studentId: text("student_id").unique().notNull(),
  courseId: integer("course_id").references(() => courses.id),
  enrollmentDate: date("enrollment_date").defaultNow(),
  status: userStatusEnum("status").default("active"),
});

// Teachers Table
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  teacherId: text("teacher_id").unique(),
  department: text("department").notNull(),
  joinDate: date("join_date").defaultNow(),
  status: userStatusEnum("status").default("pending"), // Teachers require approval
});

// Subjects Table
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique().notNull(),
  courseId: integer("course_id").references(() => courses.id),
  teacherId: integer("teacher_id").references(() => teachers.id), // Lead teacher
  credits: integer("credits").notNull(),
});

// Teacher_Subjects Junction Table (Many-to-Many)
export const teacherSubjects = pgTable("teacher_subjects", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").references(() => teachers.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
});

// Attendance Table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
});

// Marks Table
export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  examType: examTypeEnum("exam_type").notNull(),
  marks: decimal("marks", { precision: 5, scale: 2 }).notNull(),
  maxMarks: decimal("max_marks", { precision: 5, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  teacher: one(teachers, {
    fields: [users.id],
    references: [teachers.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [students.courseId],
    references: [courses.id],
  }),
  marks: many(marks),
  attendance: many(attendance),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  subjects: many(teacherSubjects),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, userId: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true, userId: true, status: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });

// Custom Schemas for API
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerTeacherSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string(),
});

export const createStudentSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  studentId: z.string(),
  courseId: z.number().optional(),
});

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Course = typeof courses.$inferSelect;
