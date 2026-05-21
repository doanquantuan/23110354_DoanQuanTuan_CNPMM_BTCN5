# Migration Summary: MongoDB to MySQL + New Features

## Date: May 20, 2026

## Project: Fullstack ExpressJS/ReactJS Application

---

## Overview

Successfully migrated the application from MongoDB/Mongoose to MySQL/Sequelize and implemented Register and ForgotPassword features.

## Changes Summary

### Backend Changes (ExpressJS01)

#### 1. **package.json**

- Removed: `mongoose@^9.6.2`
- Added:
  - `mysql2@^3.6.5` - MySQL database driver
  - `sequelize@^6.35.2` - ORM for MySQL
  - `nodemailer@^6.9.7` - Email sending for password reset

#### 2. **Database Configuration** (`src/config/database.js`)

- Migrated from Mongoose to Sequelize
- Updated connection to use MySQL with environment variables:
  - `DB_HOST` (default: localhost)
  - `DB_PORT` (default: 3306)
  - `DB_USER` (default: root)
  - `DB_PASSWORD`
  - `DB_NAME` (default: expressjs_db)
- Added auto-sync for model synchronization with database

#### 3. **User Model** (`src/models/user.js`)

- Converted from Mongoose Schema to Sequelize Model
- Added new fields:
  - `id` - INTEGER PRIMARY KEY AUTO_INCREMENT
  - `resetToken` - STRING (for password reset)
  - `resetTokenExpiry` - DATE (for token expiration)
- Added timestamps (createdAt, updatedAt)

#### 4. **User Service** (`src/services/userService.js`)

- Updated all database queries from Mongoose to Sequelize
- Added `forgotPasswordService()`:
  - Generates secure reset token
  - Sends email with reset link
  - Sets 15-minute expiration
- Added `resetPasswordService()`:
  - Validates token and expiration
  - Updates password with new hash
  - Clears reset token after successful reset
- Improved error handling with response codes (EC field)

#### 5. **User Controller** (`src/controllers/userController.js`)

- Added `handleForgotPassword()` controller
- Added `handleResetPassword()` controller
- Updated response format for consistency

#### 6. **API Routes** (`src/routes/api.js`)

- Restructured middleware application
- Added public routes (no auth required):
  - `POST /v1/api/register`
  - `POST /v1/api/login`
  - `POST /v1/api/forgot-password`
  - `POST /v1/api/reset-password`
- Added protected routes (auth required):
  - `GET /v1/api/user`
  - `GET /v1/api/account`

#### 7. **Auth Middleware** (`src/middleware/auth.js`)

- Updated white_lists to include:
  - `/forgot-password`
  - `/reset-password`
- These endpoints can be accessed without JWT token

#### 8. **Server** (`src/server.js`)

- Updated database import to use destructured `{ connection, sequelize }`
- Updated comment from mongoose to sequelize

#### 9. **Configuration Files**

- Created `.env.example` with all required environment variables:
  - Database config
  - JWT settings
  - Email settings
  - Frontend URL
  - Server port

### Frontend Changes (ReactJS01)

#### 1. **API Utilities** (`src/util/api.js`)

- Added `forgotPasswordApi()` function
- Added `resetPasswordApi()` function
- Exported new functions for use in components

#### 2. **Register Page** (`src/pages/register.jsx`)

- Enhanced validation:
  - Added email format validation
  - Added password confirmation field
  - Added minimum password length requirement
- Improved error messages in Vietnamese
- Better form layout and styling
- Proper error/success notifications

#### 3. **Login Page** (`src/pages/login.jsx`)

- Added "Quên mật khẩu?" (Forgot Password?) link
- Improved Vietnamese translations
- Better error handling and notifications
- Enhanced button styling

#### 4. **ForgotPassword Page** (`src/pages/forgot-password.jsx`) - NEW

- Clean form for requesting password reset
- Email validation
- Loading state during submission
- Redirects to login after successful submission
- Links to register page

#### 5. **ResetPassword Page** (`src/pages/reset-password.jsx`) - NEW

- Accepts token and email from URL query parameters
- Validates reset link validity
- Password confirmation validation
- 15-minute expiration warning
- Displays error message if link is invalid/expired
- Redirects to login after successful reset

#### 6. **Routing** (`src/main.jsx`)

- Added route for `/forgot-password` → ForgotPasswordPage
- Added route for `/reset-password` → ResetPasswordPage
- All routes properly configured with React Router

#### 7. **Configuration File**

- Created `.env.example` for frontend with:
  - `VITE_API_URL` - Backend API URL

### New Features Implemented

#### 1. **Register** ✓

- User can create new account with name, email, password
- Password confirmation required
- Email validation
- Prevents duplicate email registration
- Redirects to login on success
- Shows appropriate error messages

#### 2. **ForgotPassword** ✓

- User can request password reset
- System sends email with secure reset link
- Reset link valid for 15 minutes
- Secure token generated using crypto
- User receives formatted HTML email

#### 3. **ResetPassword** ✓

- User can reset password using valid token
- Validates token integrity and expiration
- Updates password with new hash
- Clears reset token after use
- Prevents reuse of expired tokens

---

## Email Configuration

For the ForgotPassword feature to work, configure Gmail:

1. Enable 2-factor authentication on Gmail account
2. Generate App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Select Mail and Windows
   - Copy generated 16-character password
3. Add to `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

---

## Database Changes

### Old Structure (MongoDB)

```
users collection (Mongoose):
- name (String)
- email (String)
- password (String)
- role (String)
```

### New Structure (MySQL)

```
users table (Sequelize):
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, NOT NULL, UNIQUE)
- password (VARCHAR, NOT NULL)
- role (VARCHAR, DEFAULT 'User')
- resetToken (VARCHAR, NULLABLE)
- resetTokenExpiry (DATETIME, NULLABLE)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

---

## Environment Variables Required

### Backend (.env in ExpressJS01/)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expressjs_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
PORT=8888
```

### Frontend (.env in ReactJS01/)

```
VITE_API_URL=http://localhost:8888
```

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] MySQL database creates automatically
- [ ] Register page works and prevents duplicate emails
- [ ] Login with new user account works
- [ ] ForgotPassword sends email correctly
- [ ] Reset password link works (15 min validity)
- [ ] New password works for login
- [ ] JWT authentication works for protected routes
- [ ] All error messages display correctly
- [ ] UI is responsive on mobile devices

---

## Next Steps

1. Install dependencies:

   ```bash
   cd ExpressJS01 && npm install
   cd ../ReactJS01 && npm install
   ```

2. Configure `.env` files in both directories

3. Create MySQL database:

   ```sql
   CREATE DATABASE expressjs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. Start backend:

   ```bash
   cd ExpressJS01
   npm run dev
   ```

5. Start frontend:

   ```bash
   cd ReactJS01
   npm run dev
   ```

6. Test all features at http://localhost:5173

---

## Files Modified/Created

### Modified Files

- `ExpressJS01/package.json`
- `ExpressJS01/src/config/database.js`
- `ExpressJS01/src/models/user.js`
- `ExpressJS01/src/services/userService.js`
- `ExpressJS01/src/controllers/userController.js`
- `ExpressJS01/src/routes/api.js`
- `ExpressJS01/src/middleware/auth.js`
- `ExpressJS01/src/server.js`
- `ReactJS01/src/util/api.js`
- `ReactJS01/src/pages/register.jsx`
- `ReactJS01/src/pages/login.jsx`
- `ReactJS01/src/main.jsx`

### New Files Created

- `ExpressJS01/.env.example`
- `ExpressJS01/.env` (user needs to create)
- `ReactJS01/.env.example`
- `ReactJS01/.env` (user needs to create)
- `ReactJS01/src/pages/forgot-password.jsx`
- `ReactJS01/src/pages/reset-password.jsx`
- `SETUP_GUIDE.md`
- `MIGRATION_SUMMARY.md` (this file)

---

## Support & Troubleshooting

### Backend Issues

- **Database connection fails**: Verify MySQL is running and credentials are correct
- **Email not sending**: Check Gmail 2FA is enabled and app password is used
- **Port already in use**: Change PORT in .env to a different value

### Frontend Issues

- **CORS errors**: Ensure backend is running and VITE_API_URL is correct
- **Pages not loading**: Check routes in main.jsx are properly configured
- **API calls fail**: Verify backend URLs match in axios configuration

### Common Solutions

1. Restart both services after changing .env
2. Clear browser cache and local storage
3. Check browser console for detailed error messages
4. Verify JWT_SECRET is consistent between frontend and backend
5. Ensure EMAIL_USER and EMAIL_PASSWORD are correct Gmail credentials

---

## Version Information

- Node.js: v14+
- MySQL: 5.7+
- Express.js: 5.2.1
- React: 18+
- Sequelize: 6.35.2
- Ant Design: Latest

---

Generated: May 20, 2026
Completed by: AI Assistant (GitHub Copilot)
