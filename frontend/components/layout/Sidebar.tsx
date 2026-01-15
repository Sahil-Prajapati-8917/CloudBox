
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconFiles,
  IconUpload,
  IconActivity,
  IconSettings,
  IconFile
} from '../ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {

  const sections = [
    {
      title: "General",
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <IconLayoutDashboard className="w-4 h-4" /> },
      ]
    },
    {
      title: "Files",
      items: [
        { id: 'all-files', label: 'All Files', path: '/files', icon: <IconFiles className="w-4 h-4" /> },
      ]
    },
    {
      title: "Tools",
      items: [
        { id: 'upload', label: 'Upload Center', path: '/upload', icon: <IconUpload className="w-4 h-4" /> },
        { id: 'activity', label: 'Recent Activity', path: '/activity', icon: <IconActivity className="w-4 h-4" /> },
      ]
    },
    {
      title: "Account",
      items: [
        { id: 'settings', label: 'Settings', path: '/settings', icon: <IconSettings className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 z-40 lg:hidden backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200
        transition-transform duration-200 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand */}
          <div className="h-14 sm:h-16 flex items-center px-4 sm:px-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-900 text-white p-1.5 rounded-md">
                <IconFiles className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">CloudBox</span>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 py-6 px-3 space-y-8 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1">
                <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h4>
                {section.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center w-full gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>


        </div>
      </aside>
    </>
  );
};

export default Sidebar;
