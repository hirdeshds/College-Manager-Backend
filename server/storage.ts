import { 
  users, students, teachers, courses,
  type User, type Student, type Teacher, type Course,
  type insertUserSchema, type insertStudentSchema, type insertTeacherSchema 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: z.infer<typeof insertUserSchema>): Promise<User>;
  
  // Teacher operations
  createTeacher(userId: number, data: z.infer<typeof insertTeacherSchema>): Promise<Teacher>;
  getTeacherByUserId(userId: number): Promise<Teacher | undefined>;
  getPendingTeachers(): Promise<(Teacher & { user: User })[]>;
  getAllTeachers(): Promise<(Teacher & { user: User })[]>;
  updateTeacherStatus(id: number, status: "active" | "rejected"): Promise<Teacher>;
  
  // Student operations
  createStudent(userId: number, data: z.infer<typeof insertStudentSchema>): Promise<Student>;
  getAllStudents(): Promise<(Student & { user: User })[]>;
  updateStudent(id: number, data: Partial<Student>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: z.infer<typeof insertUserSchema>): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createTeacher(userId: number, data: z.infer<typeof insertTeacherSchema>): Promise<Teacher> {
    const [teacher] = await db.insert(teachers).values({
      ...data,
      userId,
      status: "pending"
    }).returning();
    return teacher;
  }

  async getTeacherByUserId(userId: number): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(teachers).where(eq(teachers.userId, userId));
    return teacher;
  }

  async getPendingTeachers(): Promise<(Teacher & { user: User })[]> {
    const result = await db.select({
      teacher: teachers,
      user: users
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.status, "pending"));
    
    return result.map(({ teacher, user }) => ({ ...teacher, user }));
  }

  async getAllTeachers(): Promise<(Teacher & { user: User })[]> {
    const result = await db.select({
      teacher: teachers,
      user: users
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id));
    
    return result.map(({ teacher, user }) => ({ ...teacher, user }));
  }

  async updateTeacherStatus(id: number, status: "active" | "rejected"): Promise<Teacher> {
    const [updated] = await db.update(teachers)
      .set({ status })
      .where(eq(teachers.id, id))
      .returning();
    return updated;
  }

  async createStudent(userId: number, data: z.infer<typeof insertStudentSchema>): Promise<Student> {
    const [student] = await db.insert(students).values({
      ...data,
      userId,
      status: "active"
    }).returning();
    return student;
  }

  async getAllStudents(): Promise<(Student & { user: User })[]> {
    const result = await db.select({
      student: students,
      user: users
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id));
    
    return result.map(({ student, user }) => ({ ...student, user }));
  }

  async updateStudent(id: number, data: Partial<Student>): Promise<Student> {
    const [updated] = await db.update(students)
      .set(data)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    // Note: User will be deleted by cascade if we were deleting user, 
    // but here we might just be removing student record or handling cascading manually if needed.
    // However, schema says ON DELETE CASCADE for student -> user relation is usually User -> Student.
    // The schema provided has `user_id INT REFERENCES users(id) ON DELETE CASCADE` in students table.
    // So if we delete the USER, the STUDENT is deleted.
    // If we delete the STUDENT, the USER remains? 
    // Usually we want to delete the User account too.
    const student = await db.query.students.findFirst({
      where: eq(students.id, id)
    });
    
    if (student) {
      await db.delete(users).where(eq(users.id, student.userId));
    }
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }
}

export const storage = new DatabaseStorage();
