# Postman Testing Guide

Follow these steps to verify the backend functionality using Postman.

## Environment Setup
1. Create a new Environment in Postman.
2. Add variable `BASE_URL` with your backend URL (e.g., `https://<your-repl-name>.replit.co`).
3. Add variable `TOKEN` (leave empty initially).

## Step 1: Admin Login
1. **Method**: POST
2. **URL**: `{{BASE_URL}}/auth/login`
3. **Body** (JSON):
   ```json
   {
     "email": "admin@college.com",
     "password": "admin123"
   }
   ```
4. **Test**:
   - Status should be 200.
   - Copy the `token` from the response.
   - Set it as the `TOKEN` variable in your environment or paste it for subsequent requests.

## Step 2: Register a Teacher
1. **Method**: POST
2. **URL**: `{{BASE_URL}}/auth/teacher-register`
3. **Body** (JSON):
   ```json
   {
     "name": "Alice Teacher",
     "email": "alice@school.com",
     "password": "pass",
     "department": "Math"
   }
   ```
4. **Test**: Status 201 Created. Message: "Pending approval".

## Step 3: Try Teacher Login (Should Fail)
1. **Method**: POST
2. **URL**: `{{BASE_URL}}/auth/login`
3. **Body**: Use Alice's credentials.
4. **Test**: Status 403. Message: "Account is pending approval".

## Step 4: Admin Approves Teacher
1. **Method**: PUT
2. **URL**: `{{BASE_URL}}/admin/approve-teacher/1`
   - *Note*: Replace `1` with the actual Teacher ID (check DB or `GET /admin/pending-teachers`).
3. **Headers**: `Authorization: Bearer {{TOKEN}}` (Use Admin Token)
4. **Test**: Status 200.

## Step 5: Teacher Login (Should Success)
1. Retry Step 3.
2. **Test**: Status 200. Token returned.

## Step 6: Create Student (Admin Only)
1. **Method**: POST
2. **URL**: `{{BASE_URL}}/admin/create-student`
3. **Headers**: `Authorization: Bearer {{TOKEN}}` (Admin Token)
4. **Body**:
   ```json
   {
     "name": "Bob Student",
     "email": "bob@school.com",
     "password": "pass",
     "studentId": "STU001"
   }
   ```
5. **Test**: Status 201.

## Step 7: Access Control Check
1. Login as Student (Bob).
2. Try to access `GET /admin/pending-teachers`.
3. **Test**: Status 403 Forbidden.

## Notes for Render Deployment
- Ensure `JWT_SECRET` is set in Environment Variables.
- Ensure `DATABASE_URL` is set to your external MySQL/Postgres provider.
- The app listens on `process.env.PORT` automatically.
