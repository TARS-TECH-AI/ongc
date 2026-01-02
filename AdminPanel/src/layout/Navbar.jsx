import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import defaultAvatar from '../assets/Profile.png';

const routeTitleMap = {
  '': 'Admin Dashboard',
  'dashboard': 'Admin Dashboard',
  'approvals': 'Approved Users',
  'members': 'Member Management',
  'documents': 'Document Management',
  'gallery': 'Gallery Management',
  'settings': 'Settings',
};

const Navbar = ({ title = '', onOpen = () => {} }) => {
  const { admin } = useAuth();
  const user = admin || { name: 'Admin User' };
  const location = useLocation();

  // derive title from pathname if no explicit title prop provided
  const pathKey = location.pathname.split('/')[1] || '';
  const derivedTitle = routeTitleMap[pathKey] || 'Admin Dashboard';
  const displayTitle = title || derivedTitle;

  return (
    <header className="w-full bg-white/60 py-3 border-b border-slate-100 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          {/* Hamburger - visible on small screens */}
          <button onClick={onOpen} className="md:hidden p-2 rounded-md bg-slate-100" aria-label="Open menu">
            <Menu size={18} />
          </button>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-base sm:text-lg md:text-2xl font-bold text-slate-800 truncate">{displayTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button aria-label="Notifications" className="p-2 rounded-md hover:bg-slate-100 hidden sm:inline-flex">
            <Bell className="text-slate-700" />
          </button>

          <div className="relative inline-block">
            <button className="flex items-center gap-3 bg-slate-900 text-white px-3 py-2 rounded-md">
              <img src={admin?.avatar || defaultAvatar} alt={admin?.name || 'Profile'} className="w-7 h-7 rounded-full object-cover border border-white/20" />
              <span className="hidden sm:inline text-sm">{user?.name || 'Admin User'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
