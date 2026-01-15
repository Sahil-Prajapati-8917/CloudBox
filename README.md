# 🌩️ CloudBox - Professional Cloud Storage Dashboard

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/cloudbox)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue.svg)](https://mongodb.com)
[![AWS S3](https://img.shields.io/badge/AWS-S3-orange.svg)](https://aws.amazon.com/s3/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A **full-stack, production-ready** cloud storage management dashboard with AWS S3 integration, JWT authentication, and a beautiful responsive UI. Built for scalability, security, and user experience.

![CloudBox Preview](./preview.png)

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based stateless authentication
- Secure password hashing with bcrypt
- Protected API endpoints with middleware
- Session management with automatic logout

### 📁 **File Management**
- **Drag & Drop Upload** - Seamless file uploads to AWS S3
- **Smart File Organization** - Folder-based structure with breadcrumbs
- **Media Previews** - View images, videos, and documents directly in dashboard
- **Secure Access** - Time-limited signed URLs for file retrieval
- **Bulk Operations** - Upload multiple files simultaneously

### 🎨 **User Experience**
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Grid & List Views** - Choose your preferred file layout
- **Smooth Animations** - Professional loading states and transitions
- **Real-time Updates** - Instant feedback for all operations
- **Dark/Light Mode Ready** - Extensible theming system

### 📊 **Dashboard Analytics**
- Storage usage metrics
- File type distribution charts
- Upload activity tracking
- Recent files overview

### 🚀 **Performance & Scalability**
- AWS S3 for unlimited scalable storage
- MongoDB Atlas for flexible data storage
- Optimized file processing and streaming
- CDN-ready signed URLs for fast delivery

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 7** - Modern client-side routing
- **Lucide Icons** - Beautiful, consistent icon system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **AWS SDK v3** - Official AWS SDK for S3 operations
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

### DevOps & Deployment
- **Vercel** - Frontend deployment platform
- **Railway** - Backend deployment platform
- **Vercel KV** - Redis-compatible key-value store
- **MongoDB Atlas** - Cloud database
- **AWS S3** - Cloud object storage

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account and cluster
- **AWS Account** with S3 bucket and IAM credentials
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cloudbox.git
cd cloudbox
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create `.env` file in `backend/` directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudbox

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name
```

#### Start Backend Server
```bash
npm run dev  # Development with hot reload
# or
npm start    # Production mode
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create `.env.local` file in `frontend/` directory:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

#### Start Frontend Development Server
```bash
npm run dev
```

### 4. Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## 📁 Project Structure

```
cloudbox/
├── backend/                 # Backend API
│   ├── config/             # Database and S3 configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication and error handling
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route definitions
│   ├── server.js          # Express server entry point
│   └── package.json       # Backend dependencies
├── frontend/               # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── services/         # API service layer
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   └── package.json      # Frontend dependencies
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect it's a Vite project

2. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```

3. **Deploy**
   - Push to main branch or deploy manually
   - Vercel provides automatic HTTPS and CDN

### Backend (Railway)

1. **Connect Repository**
   - Import your GitHub repository to Railway
   - Select the `backend/` directory as the root

2. **Environment Variables**
   ```env
   PORT=5000
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=your_bucket_name
   ```

3. **Deploy**
   - Railway handles the build and deployment automatically
   - Provides persistent storage and scaling

## 🔧 Configuration

### AWS S3 Setup

1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create a new bucket with public access blocked
   - Note the bucket name and region

2. **IAM User & Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

3. **Security Best Practices**
   - Use IAM roles instead of access keys in production
   - Enable bucket versioning
   - Configure CORS for web access
   - Set up CloudFront CDN for faster delivery

### MongoDB Atlas Setup

1. **Create Cluster**
   - Choose a cloud provider and region
   - Select cluster tier (M0 for development)

2. **Network Access**
   - Add your IP address (or 0.0.0.0/0 for development)
   - For production, restrict to your server IPs

3. **Database User**
   - Create a database user with read/write access
   - Use the connection string in your `.env`

## 📡 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### File Management Endpoints

```http
POST /api/files/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

# File upload with FormData
```

```http
GET /api/files
Authorization: Bearer <jwt_token>

# Returns array of files with signed URLs
```

```http
DELETE /api/files/:id
Authorization: Bearer <jwt_token>

# Delete specific file
```

## 🐛 Troubleshooting

### Common Issues

1. **"401 Unauthorized"**
   - Check JWT token validity
   - Ensure `JWT_SECRET` is set in backend
   - Try logging out and logging back in

2. **"S3 Access Denied"**
   - Verify AWS credentials and permissions
   - Check bucket name and region
   - Ensure IAM policy allows required operations

3. **"MongoDB Connection Error"**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Ensure database user has correct permissions

4. **File Upload Fails**
   - Check file size limits (100MB default)
   - Verify supported file types
   - Check S3 bucket permissions

### Development Tips

- Use `npm run dev` for hot reload during development
- Check browser Network tab for API errors
- Use MongoDB Compass for database inspection
- Test S3 operations with AWS CLI

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure responsive design works on all devices
- Test both development and production builds

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **AWS** for reliable cloud services
- **MongoDB** for flexible database solutions
- **Vercel & Railway** for seamless deployment platforms

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cloudbox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cloudbox/discussions)
- **Email**: support@cloudbox.dev

---

**Built with ❤️ for developers who need professional cloud storage solutions.**
# CloudBox
