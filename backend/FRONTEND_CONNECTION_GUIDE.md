# Frontend Connection Guide

This backend is designed to be consumed by a separate frontend application. It provides a RESTful API using JSON.

## Base URL
- **Local/Replit**: `https://<your-repl-url>.replit.co`
- **Production (Render)**: `https://<your-render-app-name>.onrender.com`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication.
- **Header**: `Authorization: Bearer <token>`
- The token is returned upon successful login.
- Include this header in all protected routes.

## API Endpoints

### 1. Authentication
#### Login
- **URL**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "admin@college.com",
    "password": "admin123"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "token": "eyJhbGciOiJIUz...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@college.com",
      "role": "admin"
    }
  }
  ```

#### Teacher Registration
- **URL**: `POST /auth/teacher-register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "department": "Computer Science"
  }
  ```
- **Note**: Created account has `status: pending`. Requires admin approval to login.

### 2. Admin Operations (Requires `Authorization` header & Admin Role)

#### Get Pending Teachers
- **URL**: `GET /admin/pending-teachers`
- **Response**: Array of teacher objects with nested user details.

#### Approve Teacher
- **URL**: `PUT /admin/approve-teacher/:id`
- **Note**: `:id` is the **Teacher ID** (not User ID).

#### Reject Teacher
- **URL**: `DELETE /admin/reject-teacher/:id`

#### Create Student
- **URL**: `POST /admin/create-student`
- **Body**:
  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "password": "password123",
    "studentId": "S2024001",
    "courseId": 1 // Optional
  }
  ```

### 3. Student Operations (Admin Only)
- **GET /students**: List all students.
- **PUT /students/:id**: Update student details.
- **DELETE /students/:id**: Delete student.

### 4. General
- **GET /teachers**: List all teachers.

## Teacher Registration & Approval Workflow
1. Teacher registers via `POST /auth/teacher-register`. Initial status is `pending`.
2. Admin logs in and views pending list via `GET /admin/pending-teachers`.
3. Admin approves teacher via `PUT /admin/approve-teacher/:id` or rejects via `DELETE /admin/reject-teacher/:id`.
4. Only approved (status: `active`) teachers can successfully log in via `POST /auth/login`.

## Student Creation Workflow
1. Admin logs in.
2. Admin creates student via `POST /admin/create-student`.
3. Students cannot self-register; they must use the credentials provided by the Admin.

## JWT Storage & Usage
- Store the token in `localStorage` or a secure cookie on the frontend.
- Attach the token to the `Authorization` header as `Bearer <token>` for all protected requests.

## CORS Behavior
- CORS is globally enabled for all origins to facilitate frontend integration.

## Error Handling
Errors return standard HTTP codes:
- 400: Bad Request (Validation failed)
- 401: Unauthorized (Not logged in)
- 403: Forbidden (Wrong role or inactive account)
- 404: Not Found
- 500: Server Error
