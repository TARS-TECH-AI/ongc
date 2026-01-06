import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultAvatar from '../assets/Profile.png';

const AdminRegister = () => {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';
      const res = await fetch(`${API}/admin/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      const adminData = { ...(data.admin || {}), avatar: (data.admin && data.admin.avatar) ? data.admin.avatar : defaultAvatar };
      login(data.token, adminData);
      navigate('/');
    } catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center">Admin Sign Up</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Full Name"
              className="w-full pl-10 py-2 border rounded-md"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 py-2 border rounded-md"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type={showPass ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-md"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-2.5"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-10 py-2 border rounded-md"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button className="w-full bg-slate-900 text-white py-2.5 rounded-md" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Switch link */}
        <p className="mt-4 text-sm text-center text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-slate-900 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-slate-400" size={18} />
    <input
      {...props}
      required
      className="w-full pl-10 py-2 border rounded-md"
    />
  </div>
);
export default AdminRegister;
