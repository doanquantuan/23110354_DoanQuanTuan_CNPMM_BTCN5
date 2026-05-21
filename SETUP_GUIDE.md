# Fullstack Application - MongoDB to MySQL Migration & New Features

## Overview

This project has been migrated from MongoDB to MySQL and includes new features:

- **Register**: User registration with email validation
- **Forgot Password**: Password reset via email link
- **Reset Password**: Secure password reset functionality

## Prerequisites

- Node.js (v14 or higher)
- MySQL 5.7 or higher
- npm or yarn package manager

## Backend Setup (ExpressJS01)

### 1. Install Dependencies

```bash
cd ExpressJS01
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `ExpressJS01` directory based on `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expressjs_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Frontend URL (for reset password link)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=8888
```

### 3. Gmail Setup (for ForgotPassword feature)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail and Windows (or your device)
   - Copy the generated password
   - Use this password in the `EMAIL_PASSWORD` field in `.env`

### 4. Create MySQL Database

```sql
CREATE DATABASE expressjs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Start Backend Server

```bash
npm run dev
```

The server will automatically create the `users` table with all required fields.

## Frontend Setup (ReactJS01)

### 1. Install Dependencies

```bash
cd ReactJS01
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `ReactJS01` directory based on `.env.example`:

```env
VITE_API_URL=http://localhost:8888
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication

- **POST** `/v1/api/register` - User registration
  - Body: `{ name, email, password }`
- **POST** `/v1/api/login` - User login
  - Body: `{ email, password }`
  - Returns: `{ access_token, user }`

### Password Management

- **POST** `/v1/api/forgot-password` - Request password reset
  - Body: `{ email }`
- **POST** `/v1/api/reset-password` - Reset password with token
  - Body: `{ email, token, password }`

### Protected Routes (Require JWT Token)

- **GET** `/v1/api/user` - Get all users
- **GET** `/v1/api/account` - Get current user account info

## User Features

### Register

1. Go to `/register`
2. Fill in Name, Email, Password, and Confirm Password
3. Submit the form
4. You'll be redirected to login page

### Login

1. Go to `/login`
2. Enter Email and Password
3. Click Login
4. You'll be redirected to the home page

### Forgot Password

1. Go to `/login`
2. Click "Quên mật khẩu?" (Forgot password?)
3. Enter your email
4. Check your email for the reset link
5. Click the link (valid for 15 minutes)
6. Enter your new password
7. Password will be reset and you can login with the new password

## Database Schema

### users table

```
- id (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, NOT NULL, UNIQUE)
- password (VARCHAR, NOT NULL)
- role (VARCHAR, DEFAULT: 'User')
- resetToken (VARCHAR, NULLABLE)
- resetTokenExpiry (DATETIME, NULLABLE)
- createdAt (DATETIME)
- updatedAt (DATETIME)
```

## Technology Stack

### Backend

- Express.js 5.2.1
- Sequelize 6.35.2 (ORM for MySQL)
- MySQL2 3.6.5
- BCrypt 6.0.0 (Password hashing)
- JWT 9.0.3 (Authentication)
- Nodemailer 6.9.7 (Email sending)

### Frontend

- React 18
- Ant Design (UI Components)
- Axios (HTTP Client)
- React Router (Navigation)

## Troubleshooting

### Backend Issues

1. **Database connection error**: Check MySQL is running and credentials in `.env` are correct
2. **Email not sending**: Verify Gmail app password and 2FA are enabled
3. **Token errors**: Check JWT_SECRET is set in `.env`

### Frontend Issues

1. **CORS errors**: Make sure backend is running on port 8888
2. **API calls failing**: Check if backend URL is correct in `.env`
3. **Page not found**: Make sure all routes are properly configured in `main.jsx`

## Project Structure

```
ExpressJS01/
├── src/
│   ├── config/
│   │   ├── database.js (MySQL connection)
│   │   └── viewEngine.js
│   ├── controllers/
│   │   └── userController.js
│   ├── models/
│   │   └── user.js (Sequelize model)
│   ├── services/
│   │   └── userService.js (Business logic)
│   ├── routes/
│   │   └── api.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── delay.js
│   ├── views/
│   └── server.js
├── package.json
├── .env
└── .env.example

ReactJS01/
├── src/
│   ├── pages/
│   │   ├── home.jsx
│   │   ├── login.jsx
│   │   ├── register.jsx
│   │   ├── forgot-password.jsx
│   │   ├── reset-password.jsx
│   │   └── user.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   └── header.jsx
│   │   └── context/
│   │       └── auth.context.jsx
│   ├── util/
│   │   ├── api.js
│   │   └── axios.customize.js
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── .env
└── .env.example
```

## Next Steps

1. Install dependencies for both backend and frontend
2. Configure environment variables
3. Create MySQL database
4. Start backend and frontend servers
5. Test the Register, Login, and ForgotPassword features

## Support

For issues or questions, refer to the documentation or contact the development team.
