import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { StorageFile } from '../../types';
import { Toast } from '../ui/Toast';
import { IconBell, IconSearch, IconMenu } from '../ui/Icons';
import GlobalSearch from './GlobalSearch';

interface NavbarProps {
  onToggleSidebar: () => void;
  title: string;
  onLogout: () => void;
  files: StorageFile[];
  onFileSelect: (file: StorageFile) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title, onLogout, files, onFileSelect }) => {
  const { user } = useContext(AuthContext)!;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  const mockNotifications = [
    { id: 1, text: 'New login from San Francisco', time: '2m ago', unread: true },
    { id: 2, text: 'Storage usage reached 80%', time: '1h ago', unread: true },
    { id: 3, text: 'Backup completed successfully', time: '5h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 md:px-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[100]">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onToggleSidebar}
          >
            <IconMenu className="w-5 h-5" />
          </Button>

          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-500"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <IconSearch className="w-5 h-5" />
          </Button>

          <div className="hidden md:flex items-center text-sm font-medium">
            <span className="text-slate-400">Admin</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900">{title}</span>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="absolute inset-0 z-50 bg-white px-4 flex items-center border-b border-slate-200 md:hidden">
            <div className="flex-1">
              <GlobalSearch
                isMobile={true}
                onClose={() => setIsMobileSearchOpen(false)}
                onFileSelect={(file) => {
                  onFileSelect(file);
                  setIsMobileSearchOpen(false);
                }}
              />
            </div>
            <button
              className="ml-3 p-2 text-slate-500 text-sm font-bold"
              onClick={() => setIsMobileSearchOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Desktop Search */}
          <div className="hidden md:block">
            <GlobalSearch onFileSelect={onFileSelect} />
          </div>

          <div className="flex items-center gap-1.5 relative">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${isNotificationsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <IconBell className="w-5 h-5" />
                {files.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </Button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Mark all as read</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {mockNotifications.map(notif => (
                        <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${notif.unread ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-700 leading-snug">{notif.text}</p>
                              <p className="text-[10px] font-medium text-slate-400">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 text-center">
                      <button
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
                        onClick={() => { navigate('/activity'); setIsNotificationsOpen(false); }}
                      >
                        View all activity
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <button
              className="flex items-center gap-2.5 p-1 rounded-md hover:bg-slate-50 transition-colors group relative"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src="https://picsum.photos/seed/user-main/100/100"
                alt="Profile"
                className="w-7 h-7 rounded-full border border-slate-200"
              />
              <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.name || 'User'}</span>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md border border-slate-200 shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}
                  >
                    Settings
                  </button>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
