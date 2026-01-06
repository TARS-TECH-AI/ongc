import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

const Box = ({ children }) => (
  <div className="bg-white rounded-lg shadow p-4 border border-slate-100">{children}</div>
);

const Settings = () => {
  const { admin, login } = useAuth();

  // profile
  const [fullName, setFullName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [phone, setPhone] = useState(admin?.phone || '');
  const [designation, setDesignation] = useState(admin?.designation || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // update user password
  const [uFullName, setUFullName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uDesignation, setUDesignation] = useState('');
  const [uCurrent, setUCurrent] = useState('');
  const [uNew, setUNew] = useState('');
  const [uConfirm, setUConfirm] = useState('');
  const [updatingUserPwd, setUpdatingUserPwd] = useState(false);

  // system info
  const [systemInfo, setSystemInfo] = useState({ lastBackup: 'January 15, 2024 - 02:00 AM', lastContentUpdate: 'January 14, 2024 - 04:30 PM', version: 'v2.1.0', serverStatus: 'Online' });

  useEffect(() => {
    // try to fetch /admin/system if available
    (async () => {
      try {
        const token = sessionStorage.getItem('admin-token');
        const res = await fetch(`${API}/admin/system`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) return;
        const data = await res.json();
        setSystemInfo(prev => ({ ...prev, ...data }));
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const body = { name: fullName, email, phone, designation };
      // attempt server update
      const res = await fetch(`${API}/admin/profile`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
      if (res.ok) {
        const updated = await res.json();
        // update local admin info
        login(sessionStorage.getItem('admin-token'), updated);
        alert('Profile updated');
      } else {
        // fallback to local update
        const updated = { ...(admin || {}), name: fullName, email, phone, designation };
        login(sessionStorage.getItem('admin-token'), updated);
        alert('Profile updated (local)');
      }
    } catch (err) {
      const updated = { ...(admin || {}), name: fullName, email, phone, designation };
      login(sessionStorage.getItem('admin-token'), updated);
      alert('Profile updated (local)');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return alert('Please check passwords');
    setChangingPwd(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ currentPassword, newPassword }) });
      if (res.ok) {
        alert('Password changed');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Change password failed');
      }
    } catch (err) {
      alert('Change password failed');
    } finally { setChangingPwd(false); }
  };

  const handleUpdateUserPassword = async (e) => {
    e.preventDefault();
    if (!uEmail || !uNew || uNew !== uConfirm) return alert('Please check inputs');
    setUpdatingUserPwd(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/users/update-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ email: uEmail, newPassword: uNew }) });
      if (res.ok) {
        alert('User password updated');
        setUFullName(''); setUEmail(''); setUDesignation(''); setUCurrent(''); setUNew(''); setUConfirm('');
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Update failed');
      }
    } catch (err) {
      alert('Update failed');
    } finally { setUpdatingUserPwd(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold ">Manage Admin Settings</h2>
        <span className="block mb-4">Manage your account and system preferences</span>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile */}
          <Box>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">Designation</label>
                <input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full border rounded px-3 py-2" />

                <div className="mt-4">
                  <button type="submit" disabled={savingProfile} className="px-4 py-2 bg-slate-900 text-white rounded">{savingProfile ? 'Saving…' : 'Update Profile'}</button>
                </div>
              </div>
            </form>
          </Box>

          {/* Change Password */}
          <Box>
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600">Current Password</label>
                <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">New Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600">Re-Enter new paasword</label>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />

                <div className="mt-4">
                  <button type="submit" disabled={changingPwd} className="px-4 py-2 bg-slate-900 text-white rounded">{changingPwd ? 'Changing…' : 'Change Password'}</button>
                </div>
              </div>
            </form>
          </Box>

          {/* Update user password */}
          <Box>
            <form onSubmit={handleUpdateUserPassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600">User Full Name</label>
                <input value={uFullName} onChange={e => setUFullName(e.target.value)} className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">Designation</label>
                <input value={uDesignation} onChange={e => setUDesignation(e.target.value)} className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">New Password</label>
                <input value={uNew} onChange={e => setUNew(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm text-slate-600">User Email</label>
                <input value={uEmail} onChange={e => setUEmail(e.target.value)} className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">Current Password</label>
                <input value={uCurrent} onChange={e => setUCurrent(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />

                <label className="block text-sm text-slate-600 mt-3">Re-Enter new paasword</label>
                <input value={uConfirm} onChange={e => setUConfirm(e.target.value)} type="password" className="w-full border rounded px-3 py-2" />

                <div className="mt-4">
                  <button type="submit" disabled={updatingUserPwd} className="px-4 py-2 bg-slate-900 text-white rounded">{updatingUserPwd ? 'Updating…' : 'Update Password'}</button>
                </div>
              </div>
            </form>
          </Box>

          {/* System Info */}
          <Box>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <h4 className="text-sm font-semibold">System Information</h4>
                <div className="mt-3 text-sm text-slate-600">
                  <div><strong>Last Database Backup</strong><div className="text-xs text-slate-500">{systemInfo.lastBackup}</div></div>
                  <div className="mt-3"><strong>Last Content Update</strong><div className="text-xs text-slate-500">{systemInfo.lastContentUpdate}</div></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold">Status</h4>
                <div className="mt-3 text-sm text-slate-600">
                  <div><strong>System Version</strong><div className="text-xs text-slate-500">{systemInfo.version}</div></div>
                  <div className="mt-3"><strong>Server Status</strong><div className="text-xs text-slate-500"><span className={`inline-block w-2 h-2 rounded-full mr-2 ${systemInfo.serverStatus === 'Online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>{systemInfo.serverStatus}</div></div>
                </div>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Settings;
