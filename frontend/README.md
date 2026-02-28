# 🌟 CloudBox Frontend - Professional Admin Dashboard

A **production-ready, high-performance** admin dashboard for CloudBox built with modern React technologies. Features a beautiful, responsive UI with smooth animations, real-time updates, and seamless AWS S3 integration using signed URLs for secure, direct-to-cloud uploads.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan.svg)

## ✨ Key Features

### 🎨 **User Experience**
- **Responsive Design** - Perfect on mobile, tablet, and desktop (320px to 4K+)
- **Grid & List Views** - Choose your preferred file layout with smooth transitions
- **Smooth Animations** - Professional loading states with CSS transitions and spinners
- **Real-time Updates** - Instant feedback for all operations
- **Touch-Optimized** - Mobile-first design with proper touch targets

### 🔐 **Authentication**
- **JWT Integration** - Secure login/registration with backend API
- **Session Management** - Automatic logout and token refresh
- **Form Validation** - Real-time validation with error handling
- **Protected Routes** - Automatic redirects for unauthenticated users

### 👤 **User Profile & Settings**
- **Profile Management** - Update user details and personal preferences
- **Account Settings** - Dedicated page for application configurations
- **Responsive Layouts** - Optimized views for profile and account management

### 📁 **File Management**
- **Direct S3 Upload** - Secure, signed URL-based uploads bypassing server processing
- **Drag & Drop Upload** - Intuitive file uploads with real-time progress tracking
- **Smart Organization** - Folder-based structure with breadcrumbs navigation
- **Media Previews** - View images, videos, and documents directly in dashboard
- **Bulk Operations** - Upload multiple files simultaneously with individual progress
- **Secure Access** - Time-limited signed URLs (15min upload, 1hr access) for file retrieval
- **Type Filtering** - Filter by file types (all, folder, pdf, image, video, document, archive)

### 📊 **Dashboard Analytics**
- **Storage Metrics** - Usage statistics and file type distribution
- **Activity Tracking** - Recent uploads and file history
- **Visual Charts** - Interactive data visualization

## 🛠️ Tech Stack

### Core Framework
- **React 19** - Latest React with concurrent features and hooks
- **TypeScript** - Type-safe development with full IntelliSense
- **Vite** - Lightning-fast build tool and development server

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icon system
- **Custom Components** - Reusable UI components with consistent design

### State & Data
- **React Context** - Global state management for authentication
- **React Router 7** - Modern client-side routing with data loading
- **Axios** - HTTP client with interceptors and error handling

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **Hot Module Replacement** - Fast development with instant updates

## 🚥 Getting Started

### 1. Prerequisites
You **must** have the backend running for this frontend to work.
1.  Navigate to `../backend`
2.  Follow `backend/README.md` to start the server on port 5000.

### 2. Installation
```bash
cd frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `frontend/` directory (or use `.env.local`):
```env
# URL of the CloudBox Backend API
VITE_API_URL=http://localhost:5000/api
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📱 UI Components & Structure

```text
frontend/
 ├── src/
 │   ├── components/
 │   │   ├── layout/    # Sidebar, Header, Layout Wrappers
 │   │   └── ui/        # Atomic components (Buttons, Cards, Modals)
 │   ├── pages/         # Route pages (Dashboard, Login, Files, Profile, Account, Settings, etc.)
 │   ├── services/      # API calls (authService, fileService)
 │   └── App.tsx        # Main Router Setup
```

## 📦 Building for Production

To create a production build to serve via Nginx or Vercel:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 🤝 Contributing

1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/cool-feature`)
3.  Commit changes
4.  Push to branch
5.  Create a Pull Request

## ❓ Troubleshooting

### Authentication Issues

1.  **"401 Unauthorized" Loop**:
    *   **Symptom**: You are immediately logged out or get 401 errors on every request.
    *   **Cause**: Invalid or expired JWT token stored in localStorage.
    *   **Fix**: Clear localStorage and log in again. Check that `VITE_API_URL` is correctly set.

2.  **Login/Register Not Working**:
    *   **Symptom**: Forms submit but nothing happens or you get network errors.
    *   **Cause**: Backend server not running or incorrect API URL.
    *   **Fix**: Ensure backend is running on port 5000 and `.env` has correct `VITE_API_URL`.

### File Upload Issues

1.  **Upload Progress Stays at 0%**:
    *   **Symptom**: Upload appears stuck or shows no progress.
    *   **Cause**: Signed URL expired (15min limit) or network connectivity issues.
    *   **Fix**: Refresh the page and try again. Check network tab for CORS errors.

2.  **"All Uploads Failed"**:
    *   **Symptom**: Files don't appear after upload completes.
    *   **Cause**: Upload to S3 succeeded but confirmation failed, or network timeout.
    *   **Fix**: Check browser network tab. Ensure backend is running and MongoDB is accessible.

3.  **Large Files Fail**:
    *   **Symptom**: Files over 50MB fail or timeout.
    *   **Cause**: Browser/network limitations or serverless timeout.
    *   **Fix**: Split large files or upgrade to paid hosting plans with longer timeouts.

### UI & Navigation Issues

1.  **Type Filtering Not Working**:
    *   **Symptom**: Filter dropdown doesn't change file list.
    *   **Cause**: Component state not updating properly.
    *   **Fix**: Refresh the page or check browser console for React errors.

2.  **Images Not Loading**:
    *   **Symptom**: Thumbnails show broken image icons.
    *   **Cause**: Signed URLs expired (1hr limit) or S3 permissions.
    *   **Fix**: Refresh the page to get new signed URLs. Check S3 bucket permissions.

3.  **Drag & Drop Not Working**:
    *   **Symptom**: Can't drag files onto the upload area.
    *   **Cause**: Browser compatibility or JavaScript errors.
    *   **Fix**: Use the click-to-upload method instead. Check browser console.

### Performance Issues

1.  **Slow Initial Load**:
    *   **Symptom**: App takes long to load initially.
    *   **Cause**: Render free tier cold starts or large bundle size.
    *   **Fix**: Wait for backend to wake up (first request is slow) or upgrade hosting.

2.  **Memory Usage High**:
    *   **Symptom**: Browser becomes slow with many files.
    *   **Cause**: Large file lists or memory leaks.
    *   **Fix**: Use pagination or reduce files per page. Clear browser cache.

### Build & Deployment Issues

1.  **Build Fails**:
    *   **Symptom**: `npm run build` exits with errors.
    *   **Cause**: TypeScript errors or missing dependencies.
    *   **Fix**: Run `npm install` and check for TypeScript errors in your IDE.

2.  **Environment Variables Not Working**:
    *   **Symptom**: API calls fail with network errors.
    *   **Cause**: `.env` file not loaded or incorrect variable names.
    *   **Fix**: Ensure variables start with `VITE_` and restart dev server.
