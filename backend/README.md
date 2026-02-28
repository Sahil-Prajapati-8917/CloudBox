# 🔧 CloudBox Backend API - Production-Ready File Storage

A **robust, scalable, and secure** backend API for CloudBox built with modern Node.js technologies. Features enterprise-grade security, direct-to-S3 signed URL uploads, and comprehensive file management optimized for serverless deployments.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4-black.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-blue.svg)
![AWS S3](https://img.shields.io/badge/AWS-S3-orange.svg)

## 🚀 Key Features

### 🔐 **Security & Authentication**
- **JWT Authentication** - Stateless, secure user authentication with refresh tokens
- **Password Security** - BCrypt hashing with salt rounds for maximum security
- **Protected Routes** - Middleware-based route protection with role-based access
- **Security Headers** - Helmet.js implementation with comprehensive security headers
- **CORS Protection** - Configurable Cross-Origin Resource Sharing

### 📁 **File Management & Storage**
- **Direct S3 Uploads** - Signed URL architecture bypassing server processing for scalability
- **AWS S3 Integration** - Scalable cloud storage with multi-region support
- **Large File Support** - Files up to 100MB with client-side streaming uploads
- **Secure Access** - Time-limited signed URLs (15min upload, 1hr access) for file retrieval
- **Metadata Management** - Comprehensive file information storage in MongoDB
- **File Organization** - Folder-based structure with nested file support
- **No Server Processing** - Optimized for serverless deployments (Render, Vercel)

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
    *   Response: `{ user, token }`
*   `POST /api/auth/login` - Login
    *   Body: `{ email, password }`
    *   Response: `{ user, token }`
*   `GET /api/auth/profile` - Get user profile
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `{ _id, name, email, ... }`

### Files (Requires Header `Authorization: Bearer <token>`)

*   `POST /api/files/upload` - Prepare file upload with signed URL
    *   Body: `{ fileName, fileType, fileSize, parentId? }`
    *   Response: `{ signedUrl, fileData, uploadId }`
*   `POST /api/files/confirm-upload` - Confirm successful upload
    *   Body: `{ uploadId, fileData }`
    *   Response: `{ _id, fileName, fileType, ... }`
*   `GET /api/files` - List files with signed URLs
    *   Query: `?parentId=<folder_id>`
    *   Returns: `[{ _id, fileName, fileType, url (signed), size, ... }]`
*   `DELETE /api/files/:id` - Delete file
    *   Response: `{ message: "File removed" }`
*   `POST /api/files/create-folder` - Create folder
    *   Body: `{ name, parentId? }`
    *   Response: `{ _id, fileName, isFolder: true, ... }`

### Upload Flow

1. **Prepare Upload**: Call `POST /api/files/upload` with file metadata
2. **Direct S3 Upload**: Use returned `signedUrl` to upload file directly to S3
3. **Confirm Upload**: Call `POST /api/files/confirm-upload` to save metadata

```javascript
// Example upload flow
const prepareResponse = await api.post('/files/upload', {
  fileName: 'document.pdf',
  fileType: 'application/pdf',
  fileSize: 1024000
});

const { signedUrl, fileData, uploadId } = prepareResponse.data;

// Upload directly to S3
await fetch(signedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// Confirm upload
await api.post('/files/confirm-upload', { uploadId, fileData });
```

## ❓ Troubleshooting

### Database & Authentication
*   **MongoDB Error**: Ensure your IP is whitelisted in MongoDB Atlas Network Access.
*   **400 Bad Request on Login**:
    *   **Cause**: User does not exist in database or invalid credentials.
    *   **Fix**: Register a new user via the `/api/auth/register` endpoint first.
*   **JWT Errors**: If `JWT_SECRET` is missing in `.env`, the server will warn you on startup.

### File Upload Issues
*   **S3 Access Denied**: Check IAM policy permissions (`PutObject`, `GetObject`, `DeleteObject`).
*   **Signed URL Expired**: Upload URLs expire in 15 minutes. Call `/api/files/upload` again for a new URL.
*   **Upload Fails Silently**: Check browser network tab for CORS errors. Ensure S3 bucket allows cross-origin requests.
*   **File Not Found After Upload**: Confirm upload completed successfully before calling `/api/files/confirm-upload`.

### Serverless Deployment
*   **Render Free Tier Sleep**: Backend sleeps after inactivity. First request may be slow (cold start).
*   **Timeout Errors**: Large uploads may timeout on free tiers. Consider paid plans for production.
*   **CORS Issues**: Ensure frontend domain is whitelisted in server CORS configuration.

### Common Error Codes
*   **401 Unauthorized**: Invalid or expired JWT token. Try logging in again.
*   **403 Forbidden**: User doesn't own the requested file or folder.
*   **404 Not Found**: File/folder doesn't exist or signed URL has expired.
*   **413 Payload Too Large**: File exceeds 100MB limit.
*   **429 Too Many Requests**: Rate limiting active (if implemented).
