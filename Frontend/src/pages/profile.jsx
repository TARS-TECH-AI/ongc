import React, { useState, useEffect } from "react";
import { User, Mail, Phone, IdCard, FileText, Shield, CheckCircle, XCircle, Clock } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view profile');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        icon: <Clock className="w-4 h-4" />,
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Approval"
      },
      Approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved"
      },
      Rejected: {
        icon: <XCircle className="w-4 h-4" />,
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected"
      }
    };

    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="text-red-600 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div>
              {getStatusBadge(user?.status)}
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-500" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Full Name</p>
                <p className="text-gray-900 font-semibold">{user?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <p className="text-gray-900 font-semibold">{user?.email}</p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Mobile Number</p>
                <p className="text-gray-900 font-semibold">{user?.mobile}</p>
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3">
              <IdCard className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Employee ID</p>
                <p className="text-gray-900 font-semibold">{user?.employeeId}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Category</p>
                <p className="text-gray-900 font-semibold">{user?.category}</p>
              </div>
            </div>

            {/* ID Proof */}
            {user?.idProofDocument && (
              <div className="flex items-start gap-3 md:col-span-2">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">ID Proof Document</p>
                  <a 
                    href={user.idProofDocument}
                    download={user.idProofFileName || 'id-proof'}
                    className="text-orange-500 hover:text-orange-600 font-semibold underline inline-flex items-center gap-2"
                  >
                    {user.idProofFileName || 'Download Document'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            )}

            {/* Registration Date */}
            <div className="flex items-start gap-3 md:col-span-2">
              <Clock className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Member Since</p>
                <p className="text-gray-900 font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          {user?.status === 'Pending' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your registration is pending approval. You will be notified once your account is reviewed by the administrator.
              </p>
            </div>
          )}

          {user?.status === 'Approved' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Congratulations!</strong> Your account has been approved. You now have full access to all member features.
              </p>
            </div>
          )}

          {user?.status === 'Rejected' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Notice:</strong> Your registration was not approved. Please contact the administrator for more information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
