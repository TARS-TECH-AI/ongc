import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const LoginForm = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      // robust parsing: handle empty/non-json responses
      const text = await res.text();
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch (err) { json = {}; }
      if (!res.ok) throw new Error(json.message || 'Login failed');
      if (json.token) localStorage.setItem('token', json.token);
      if (json.user) localStorage.setItem('user', JSON.stringify(json.user));
      console.log('Login success', json);
      onSuccess && onSuccess(json.user, 'login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-orange-500"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold cursor-pointer">
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6 sm:p-8">

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#0C2E50]">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Login to your account
        </p>

        <LoginForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span className="text-orange-500 cursor-pointer hover:underline">
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
