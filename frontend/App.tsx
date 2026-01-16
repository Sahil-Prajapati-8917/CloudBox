
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Upload from './pages/Upload';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import { ViewType, StorageFile, FileType } from './types';
import fileService from './services/fileService';
// import { MOCK_STATS } from './data/mockFiles';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';


const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useContext(AuthContext)!;
  console.log('ProtectedRoute check:', { user: !!user, isLoading });

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing loading screen');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, allowing access');
  return <Outlet />;
};

const App: React.FC = () => {
  const { user, logout } = useContext(AuthContext)!;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = !!user;
  console.log('App render:', { user: !!user, isAuthenticated, currentPath: location.pathname });

  // Fetch files when user is authenticated
  useEffect(() => {
    if (user) {
      // Check if we are in a folder route
      const pathParts = location.pathname.split('/');
      let folderId: string | undefined;

      if (pathParts[1] === 'files' && pathParts[2]) {
        // This is a folder ID
        folderId = pathParts[2];
      }

      loadFiles(folderId);
    } else {
      setFiles([]);
    }
  }, [user, location.pathname]);

  // Load files for specific folder (or root)
  const loadFiles = async (folderId?: string) => {
    try {
      const data = await fileService.getFiles(folderId);
      // Map API response to StorageFile interface
      const mappedFiles: StorageFile[] = data.map((f: any) => {
        let fileType: FileType = 'file' as FileType;
        if (f.isFolder) {
          fileType = 'folder';
        } else if (f.fileType.startsWith('image/')) {
          fileType = 'image';
        } else if (f.fileType.startsWith('video/')) {
          fileType = 'video';
        } else if (f.fileType.includes('pdf')) {
          fileType = 'document';
        } else if (f.fileType.includes('zip') || f.fileType.includes('rar') || f.fileType.includes('7z')) {
          fileType = 'archive';
        } else if (f.fileType.startsWith('text/') || f.fileType.includes('document')) {
          fileType = 'document';
        }

        return {
          id: f._id,
          name: f.fileName,
          type: fileType,
          size: f.size,
          uploadedAt: new Date(f.uploadedAt),
          owner: user?.name,
          url: f.url, // Signed URL from backend
          parentId: f.parentId,
          isFolder: f.isFolder
        };
      });

      setFiles(mappedFiles);
    } catch (err: any) {
      console.error('Failed to load files', err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await fileService.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };

  const handleAddFolder = async (name: string, parentId?: string) => {
    try {
      const newFolder = await fileService.createFolder({ name, parentId });
      // Map the response to StorageFile format
      const mappedFolder: StorageFile = {
        id: newFolder._id,
        name: newFolder.fileName,
        type: 'folder' as FileType,
        size: newFolder.size,
        uploadedAt: new Date(newFolder.uploadedAt),
        owner: user?.name || 'User',
        parentId: newFolder.parentId,
        isFolder: newFolder.isFolder
      };
      setFiles(prev => [mappedFolder, ...prev]);
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error; // Re-throw so Files component can handle the error
    }
  };

  const handleUploadSuccess = (newFiles: StorageFile[]) => {
    // Add new files to the current list
    setFiles(prev => [...newFiles, ...prev]);
    // Also refresh to ensure consistency
    loadFiles();
  };

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  const handleFileSelect = (file: StorageFile) => {
    if (file.type === 'folder') {
      navigate(`/files/${file.id}`);
    } else {
      navigate(`/files`);
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/files')) {
      const parts = path.split('/');
      const folderId = parts[2];
      if (folderId) {
        const folder = files.find(f => f.id === folderId);
        return folder ? folder.name : 'Files';
      }
      return 'Files';
    }

    switch (path) {
      case '/':
      case '/dashboard': return 'Dashboard';
      case '/upload': return 'Upload';
      case '/activity': return 'Activity';
      case '/settings': return 'Settings';
      case '/profile': return 'Profile';
      default: return 'Admin';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/account" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Account />
      } />
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 max-w-[1400px] w-full mx-auto">
                <Dashboard
                  files={files}
                  stats={{
                    totalFiles: files.length,
                    storageUsed: (() => {
                      const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
                      return formatBytes(totalBytes);
                    })(),
                    storageLimit: '15 GB', // Hardcoded limit for now
                    recentUploadsCount: files.filter(f => {
                      const oneDayAgo = new Date();
                      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                      return f.uploadedAt > oneDayAgo;
                    }).length
                  }}
                />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/files" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Files
                  files={files}
                  onDelete={handleDeleteFile}
                  onAddFolder={(name) => handleAddFolder(name)}
                  onRefresh={loadFiles}
                />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/files/:folderId" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Files
                  files={files}
                  onDelete={handleDeleteFile}
                  onAddFolder={(name, parentId) => handleAddFolder(name, parentId)}
                  onRefresh={() => {
                    const pathParts = location.pathname.split('/');
                    const folderId = pathParts[1] === 'files' && pathParts[2] ? pathParts[2] : undefined;
                    loadFiles(folderId);
                  }}
                />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/upload" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Upload onUploadSuccess={handleUploadSuccess} />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/activity" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Activity files={files} />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/settings" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Settings />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="flex min-h-screen bg-white">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(true)}
                title={getPageTitle()}
                onLogout={logout}
                files={files}
                onFileSelect={handleFileSelect}
              />

              <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] w-full mx-auto">
                <Profile files={files} />
              </main>

              <footer className="h-16 flex items-center justify-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  CloudBox Dashboard © 2024
                </p>
              </footer>
            </div>
          </div>
        } />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
