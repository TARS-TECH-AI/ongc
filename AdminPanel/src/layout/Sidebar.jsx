import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/Vector.png';
import { Grid, UserCheck, Users, FileText, Image, MessageSquare, Settings, LogOut, Bell } from 'lucide-react';

const Icon = ({ name }) => {
  const props = { size: 20, className: 'text-slate-700' };
  switch (name) {
    case 'dashboard':
      return <Grid {...props} />;
    case 'approvals':
      return <UserCheck {...props} />;
    case 'members':
      return <Users {...props} />;
    case 'documents':
      return <FileText {...props} />;
    case 'updates':
      return <Bell {...props} />;
    case 'gallery':
      return <Image {...props} />;
    case 'enquiry':
      return <MessageSquare {...props} />;
    case 'settings':
      return <Settings {...props} />;
    case 'logout':
      return <LogOut {...props} />;
    default:
      return null;
  }
};
const menu = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/' },
  { key: 'approvals', label: 'User Approvals', icon: 'approvals', to: '/approvals' },
  { key: 'members', label: 'Members', icon: 'members', to: '/members' },
  { key: 'documents', label: 'Documents', icon: 'documents', to: '/documents' },
  { key: 'updates', label: 'Important Updates', icon: 'updates', to: '/updates' },
  { key: 'gallery', label: 'Gallery management', icon: 'gallery', to: '/gallery' },
  { key: 'enquiry', label: 'Enquiry', icon: 'enquiry', to: '/enquiry' },
  // { key: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
];

export default function Sidebar({ open, setOpen }) {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <> 
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:sticky md:top-0 md:h-screen md:bg-white/80 md:backdrop-blur-sm md:border-r md:border-slate-100 p-4 z-30">
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="px-2 mb-4 flex items-center gap-3">
              <img src={admin?.avatar || defaultAvatar} alt={admin?.name || 'Admin'} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-slate-800 font-semibold text-lg">Admin Panel</div>
                <div className="text-xs text-slate-500">{admin?.name ? admin.name : 'Welcome'}</div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {menu.map((m) => (
                <NavLink
                  key={m.key}
                  to={m.to}
                  className={({ isActive }) => `flex items-center gap-3 text-slate-800 px-3 py-2 rounded-lg transition-colors duration-150 ${isActive ? 'bg-sky-200/60 shadow-sm' : 'hover:bg-slate-100'}`}
                  end={m.to === '/'}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center ${isActive ? 'bg-white/80' : 'bg-white'}`}>
                        <Icon name={m.icon} />
                      </div>
                      <span className="text-sm font-medium">{m.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="px-2">
            <button onClick={handleLogout} className="flex items-center gap-2 text-pink-600 text-sm">
              <div className="w-6 h-6 flex items-center justify-center text-pink-600"><Icon name="logout" /></div>
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 cursor-pointer" onClick={() => setOpen?.(false)} />

          <aside className="relative w-64 sm:w-72 bg-white p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={admin?.avatar || defaultAvatar} alt={admin?.name || 'Admin'} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-slate-800 font-semibold">Admin Panel</div>
                  <div className="text-xs text-slate-500">{admin?.name ? admin.name : 'Welcome'}</div>
                </div>
              </div>
              <button onClick={() => setOpen?.(false)} aria-label="Close" className="p-2 rounded-md bg-slate-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              <nav className="flex flex-col gap-2">
                {menu.map((m) => (
                  <NavLink
                    key={m.key}
                    to={m.to}
                    className={({ isActive }) => `flex items-center gap-3 text-slate-800 px-3 py-2 rounded-lg transition-colors duration-150 ${isActive ? 'bg-sky-200/60 shadow-sm' : 'hover:bg-slate-100'}`}
                    end={m.to === '/'}
                    onClick={() => setOpen?.(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${isActive ? 'bg-white/80' : 'bg-white'}`}>
                          <Icon name={m.icon} />
                        </div>
                        <span className="text-sm font-medium">{m.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="mt-4 border-t pt-4">
              <button onClick={handleLogout} className="flex items-center gap-2 text-pink-600 text-sm w-full justify-start">
                <div className="w-6 h-6 flex items-center justify-center text-pink-600"><Icon name="logout" /></div>
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
