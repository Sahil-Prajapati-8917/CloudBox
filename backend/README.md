# 🔧 CloudBox Backend API - Production-Ready File Storage

A **robust, scalable, and secure** backend API for CloudBox built with modern Node.js technologies. Features enterprise-grade security, AWS S3 integration, and comprehensive file management with real-time processing.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4-black.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue.svg)
![AWS S3](https://img.shields.io/badge/AWS-S3-orange.svg)

## 🚀 Key Features

### 🔐 **Security & Authentication**
- **JWT Authentication** - Stateless, secure user authentication with refresh tokens
- **Password Security** - BCrypt hashing with salt rounds for maximum security
- **Protected Routes** - Middleware-based route protection with role-based access
- **Security Headers** - Helmet.js implementation with comprehensive security headers
- **CORS Protection** - Configurable Cross-Origin Resource Sharing

### 📁 **File Management & Storage**
- **AWS S3 Integration** - Scalable cloud storage with multi-region support
- **Large File Support** - Streaming uploads for files up to 100MB
- **Secure Access** - Time-limited signed URLs (1-hour expiration) for file retrieval
- **Metadata Management** - Comprehensive file information storage in MongoDB
- **File Organization** - Folder-based structure with nested file support
- **Real-time Processing** - Instant file validation and processing

### 🗄️ **Database & Performance**
- **MongoDB Atlas** - Cloud-hosted database with automatic scaling
- **Mongoose ODM** - Type-safe database operations with validation
- **Optimized Queries** - Indexed fields for fast file retrieval
- **Connection Pooling** - Efficient database connection management
- **Error Handling** - Comprehensive error middleware with logging

### 📊 **API & Monitoring**
- **RESTful API** - Clean, consistent API design following REST principles
- **Request Validation** - Input sanitization and validation
- **Rate Limiting Ready** - Built-in support for rate limiting
- **Logging** - Structured logging for debugging and monitoring
- **Health Checks** - API health monitoring endpoints

## 📂 Project Structure

```text
backend/
 ├── config/
 │   ├── db.js            # MongoDB connection logic
 │   └── s3.js            # AWS S3 client configuration
 ├── controllers/
 │   ├── authController.js # Logic for login/register
 │   └── fileController.js # Logic for upload/list/delete
 ├── middleware/
 │   ├── authMiddleware.js # Protects routes using JWT
 │   └── errorMiddleware.js# Global error handling
 ├── models/
 │   ├── User.js          # Mongoose schema for User
 │   └── File.js          # Mongoose schema for File
 ├── routes/
 │   ├── authRoutes.js    # Routes for auth endpoints
 │   └── fileRoutes.js    # Routes for file endpoints
 ├── .env                 # Environment variables (secrets)
 ├── server.js            # Entry point
 └── package.json         # Dependencies and scripts
```

## 📋 Prerequisites

*   **Node.js** (v16+)
*   **MongoDB Atlas URI** (Create a cluster at [mongodb.com](https://www.mongodb.com/))
*   **AWS S3 Bucket** (Create a bucket at [aws.amazon.com](https://aws.amazon.com/))

## ⚙️ Installation & Setup

1.  **Clone & Navigate**
    ```bash
    git clone <repo_url>
    cd backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cloudbox
    JWT_SECRET=your_super_secret_key_here

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID=your_access_key
    AWS_SECRET_ACCESS_KEY=your_secret_key
    AWS_REGION=us-east-1
    AWS_BUCKET_NAME=your-bucket-name
    ```

## 🏃‍♂️ Running the Server

*   **Development (with Hot Reload)**
    ```bash
    npm run dev
    ```
    *Runs on `http://localhost:5000`*

*   **Production Start**
    ```bash
    npm start
    ```

## 📡 API Reference

### Auth

*   `POST /api/auth/register` - Create account
    *   Body: `{ name, email, password }`
*   `POST /api/auth/login` - Login
    *   Body: `{ email, password }`

### Files (Requires Header `Authorization: Bearer <token>`)

*   `POST /api/files/upload` - Upload file
    *   Body (Form-Data): `file`
*   `GET /api/files` - List files
    *   Returns: `[{ _id, fileName, url (signed), ... }]`
*   `DELETE /api/files/:id` - Delete file

## ❓ Troubleshooting

*   **MongoDB Error**: Ensure your IP is whitelisted in MongoDB Atlas Network Access.
*   **S3 Access Denied**: Check IAM policy permissions (`PutObject`, `GetObject`, `DeleteObject`).
*   **400 Bad Request on Login**:
    *   **Cause**: User `admin@cloudbox.io` does not exist in a fresh database.
    *   **Fix**: Register a new user via the `/api/auth/register` endpoint or use the Frontend Register page first.
    *   **Note**: Validation errors (missing fields) also return 400. Check server logs for exact details.
*   **JWT Errors**: If `JWT_SECRET` is missing in `.env`, the server will warn you on startup. Authentication requires this secret to be set.
