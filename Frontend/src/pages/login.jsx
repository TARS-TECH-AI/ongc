import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LoginForm = ({onSuccess, onOpenRegister}) => {
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
      if (json.token) sessionStorage.setItem('token', json.token);
      if (json.user) {
        // Remove large document data before storing in sessionStorage
        const { idProofDocument, idProofFileName, idProofFileType, ...userDataToStore } = json.user;
        sessionStorage.setItem('user', JSON.stringify(userDataToStore));
      }
      console.log('Login success', json);
      onSuccess && onSuccess(json.user, 'login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

      {/* Email */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="Enter your password"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-orange-500 transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

      <button disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-semibold cursor-pointer transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {/* <p className="text-center text-sm text-black mt-4">
        Don't have account?{" "}
        <button type="button" onClick={() => onOpenRegister && onOpenRegister()} className="text-orange-500 cursor-pointer hover:underline">
          Register
        </button>
      </p> */}
    </form>
  );
};

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0C2E50] to-orange-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Login to your account
          </p>
        </div>

        <LoginForm onOpenRegister={() => navigate('/register')} />
      </div>
    </div>
  );
};

export default Login;
