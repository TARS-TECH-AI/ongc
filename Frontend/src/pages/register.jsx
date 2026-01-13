import React, { useState } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";

export const RegisterForm = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    employeeId: "",
    designation: "",
    category: "",
    password: "",
    confirmPassword: "",
  });

  const [idProof, setIdProof] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Field-level availability errors (email, mobile, employeeId)
  const [fieldErrors, setFieldErrors] = useState({ email: '', mobile: '', employeeId: '' });

  const checkFieldAvailability = async (field, value) => {
    const v = (value || '').trim();
    if (!v) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }
    try {
      // send normalized value for email
      const sendVal = field === 'email' ? v.toLowerCase() : v;
      const res = await fetch(`${API}/auth/check?field=${encodeURIComponent(field)}&value=${encodeURIComponent(sendVal)}`);
      const json = await res.json();
      if (!res.ok) {
        // on error, clear specific field error (don't block user due to transient issues)
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, [field]: json.available ? '' : (json.message || 'Your registration already exists. Please login.') }));
    } catch (err) {
      console.error('Check field error', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear global error while user edits
    setError(null);
    // Clear that field's availability error while typing
    if (['email','mobile','employeeId'].includes(e.target.name)) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
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

  const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Prevent submit if any field-level errors exist
    if (Object.values(fieldErrors).some(Boolean)) {
      setError('Please fix highlighted errors before submitting');
      return;
    }

    // Validate all required fields
    if (!formData.name || !formData.email || !formData.mobile || !formData.employeeId || !formData.designation || !formData.category || !formData.password || !formData.confirmPassword) {
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
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        employeeId: formData.employeeId.trim(),
        designation: formData.designation.trim(),
        category: formData.category,
        password: formData.password
      };
      
      // Add document if uploaded
      // Prepare payload as FormData so file is uploaded directly
      const form = new FormData();
      form.append('name', registrationData.name);
      form.append('email', registrationData.email);
      form.append('mobile', registrationData.mobile);
      form.append('employeeId', registrationData.employeeId);
      form.append('designation', registrationData.designation);
      form.append('category', registrationData.category);
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
      // Normalize duplicate registration messages to a single friendly prompt
      const msg = err && err.message && /already/i.test(err.message) ? 'Your registration already exists. Please login.' : (err && err.message) || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={(e) => checkFieldAvailability('email', e.target.value.trim())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="your.email@example.com"
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="mobile"
            required
            value={formData.mobile}
            onChange={handleChange}
            onBlur={(e) => checkFieldAvailability('mobile', e.target.value.trim())}
            pattern="[0-9]{10}"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="10 digit mobile number"
          />
          {fieldErrors.mobile && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>
          )}
        </div>

        {/* Employee ID */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            required
            value={formData.employeeId}
            onChange={handleChange}
            onBlur={(e) => checkFieldAvailability('employeeId', e.target.value.trim())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="Enter your employee ID"
          />
          {fieldErrors.employeeId && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.employeeId}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm hover:shadow-md"
          >
            <option value="">Select category</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="OBC">OBC</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Designation */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Designation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="designation"
            required
            value={formData.designation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
            placeholder="Enter your designation"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
              placeholder="Minimum 6 characters"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-orange-500 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-sm hover:shadow-md"
              placeholder="Re-enter password"
            />
            <span
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-orange-500 transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        {/* ID Proof Upload */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            ID Proof Document <span className="text-red-500">*</span>
          </label>
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md">
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
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
      >
        {loading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
};

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-14 border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#0C2E50] to-orange-500 bg-clip-text text-transparent mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm">
            Fill in the details below to register
          </p>
        </div>

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
