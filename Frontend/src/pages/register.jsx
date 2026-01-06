import React, { useState } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";

export const RegisterForm = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    employeeId: "",
    password: "",
    confirmPassword: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Increased size limit warning
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should not exceed 2MB for better performance");
        setIdProof(null);
        setIdProofPreview("");
        return;
      }
      setIdProof(file);
      setIdProofPreview(file.name);
      setError(null);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate all required fields
    if (!formData.name || !formData.email || !formData.mobile || !formData.employeeId || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!idProof) {
      setError('ID Proof document is required');
      return;
    }

    setLoading(true);
    
    try {
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        employeeId: formData.employeeId.trim(),
        password: formData.password
      };
      
      // Add document if uploaded
      // Prepare payload as FormData so file is uploaded directly
      const form = new FormData();
      form.append('name', registrationData.name);
      form.append('email', registrationData.email);
      form.append('mobile', registrationData.mobile);
      form.append('employeeId', registrationData.employeeId);
      form.append('password', registrationData.password);

      if (idProof) {
        form.append('idProof', idProof, idProof.name);
      }

      console.log('Sending registration data (FormData)');

      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        body: form,
      });

      const text = await res.text();
      console.log('Server response:', text);
      console.log('Response status:', res.status);
      
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch (err) { 
        console.error('Failed to parse response:', err);
        json = { message: text || 'Unknown error' }; 
      }
      
      if (!res.ok) {
        const errorMsg = json.message || json.error || `Registration failed (${res.status})`;
        console.error('Registration error:', errorMsg, json);
        throw new Error(errorMsg);
      }
      
      if (json.token) sessionStorage.setItem('token', json.token);
      if (json.user) {
        // Remove large document data before storing in sessionStorage
        const { idProofDocument, idProofFileName, idProofFileType, ...userDataToStore } = json.user;
        sessionStorage.setItem('user', JSON.stringify(userDataToStore));
      }
      
      console.log('Register success', json);
      onSuccess && onSuccess(json.user, 'register');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            required
            value={formData.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="10 digit mobile number"
          />
        </div>

        {/* Employee ID */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            required
            value={formData.employeeId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="Enter your employee ID"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="Minimum 6 characters"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="Re-enter password"
            />
            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {/* ID Proof Upload */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            ID Proof Document <span className="text-red-500">*</span>
          </label>
          <label className="flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
            <Upload className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">
              {idProofPreview || "Upload (JPG, PNG, PDF - Max 2MB)"}
            </span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
          {error}
        </div>
      )}

      <button 
        disabled={loading} 
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 shadow-md hover:shadow-lg"
      >
        {loading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
};

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-7xl bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12">

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#0C2E50] mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Fill in the details below to register
        </p>

        <RegisterForm />

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
