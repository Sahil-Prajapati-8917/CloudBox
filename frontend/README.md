# 🌟 CloudBox Frontend - Professional Admin Dashboard

A **production-ready, high-performance** admin dashboard for CloudBox built with modern React technologies. Features a beautiful, responsive UI with smooth animations, real-time updates, and seamless AWS S3 integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan.svg)

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

### 📁 **File Management**
- **Drag & Drop Upload** - Intuitive file uploads with progress tracking
- **Smart Organization** - Folder-based structure with breadcrumbs navigation
- **Media Previews** - View images, videos, and documents directly in dashboard
- **Bulk Operations** - Upload multiple files simultaneously
- **Secure Access** - Time-limited signed URLs for file retrieval

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
 │   ├── pages/         # Route pages (Dashboard, Login, Files)
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

### Common Issues & Fixes

1.  **"401 Unauthorized" Loop**:
    *   **Symptom**: You are immediately logged out or get 401 errors on every request.
    *   **Cause**: Axios v1.x compatibility with header setting, or invalid token.
    *   **Fix**: Ensure `services/api.ts` uses `config.headers.set('Authorization', ...)` instead of dot notation. `App.tsx` handles this by auto-logging out to clear stale tokens.

2.  **"Form Submission Canceled"**:
    *   **Symptom**: Clicking "Upload" cancels the request or reloads the page.
    *   **Cause**: Buttons inside forms act as `submit` by default.
    *   **Fix**: Explicitly add `type="button"` to any action buttons like "Confirm & Upload".

3.  **"All Uploads Failed"**:
    *   **Symptom**: Files don't appear after upload success.
    *   **Cause**: Backend returns raw file objects, but frontend expects `{ success: true, data: ... }`.
    *   **Fix**: Update `Upload.tsx` to handle the direct file object response.
