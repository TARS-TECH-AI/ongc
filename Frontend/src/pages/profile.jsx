import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  IdCard,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Eye,
  Upload,
} from "lucide-react";

const Profile = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newIdProof, setNewIdProof] = useState(null);
  const [newIdProofPreview, setNewIdProofPreview] = useState("");
  const [showApprovalMessage, setShowApprovalMessage] = useState(false);

  const API =
    import.meta.env.VITE_API_URL || "https://ongc-q48j.vercel.app/api";

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should not exceed 2MB");
        setNewIdProof(null);
        setNewIdProofPreview("");
        return;
      }
      setNewIdProof(file);
      setNewIdProofPreview(file.name);
      setError(null);
    }
  };

  const handleViewDocument = () => {
    if (user?.idProofDocument) {
      const newWindow = window.open();
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${user.idProofFileName || "ID Proof Document"}</title>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              iframe { width: 100%; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            ${
              user.idProofFileType?.includes("pdf")
                ? `<iframe src="${user.idProofDocument}"></iframe>`
                : `<img src="${user.idProofDocument}" alt="ID Proof" />`
            }
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Please login to view profile");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setUser(data.user);
      setEditedData({
        name: data.user.name,
        mobile: data.user.mobile,
        employeeId: data.user.employeeId,
        designation: data.user.designation || '',
        category: data.user.category || '',
      });

      // Check if we should show approval message (only once)
      if (data.user.status === 'Approved') {
        const approvalShownKey = `approval_shown_${data.user._id}`;
        const hasShownApproval = sessionStorage.getItem(approvalShownKey);
        
        if (!hasShownApproval) {
          setShowApprovalMessage(true);
          sessionStorage.setItem(approvalShownKey, 'true');
          
          // Auto-hide message after 10 seconds
          setTimeout(() => {
            setShowApprovalMessage(false);
          }, 10000);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      name: user.name,
      mobile: user.mobile,
      employeeId: user.employeeId,
      designation: user.designation || '',
      category: user.category || '',
    });
    setNewIdProof(null);
    setNewIdProofPreview("");
    setError(null);
  }; 

  const handleSave = async () => {
    setUpdateLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      const updateData = {
        name: editedData.name || user?.name || '',
        mobile: editedData.mobile || user?.mobile || '',
        employeeId: editedData.employeeId || user?.employeeId || '',
        designation: editedData.designation || user?.designation || '',
        category: editedData.category || user?.category || '',
      };
      console.log('Sending profile update:', updateData);

      let res;
      if (newIdProof) {
        const form = new FormData();
        form.append('name', updateData.name || '');
        form.append('mobile', updateData.mobile || '');
        form.append('employeeId', updateData.employeeId || '');
        form.append('designation', updateData.designation || '');
        form.append('category', updateData.category || '');
        form.append('idProof', newIdProof, newIdProof.name);

        res = await fetch(`${API}/auth/profile`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
      } else {
        res = await fetch(`${API}/auth/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
      }

      // Handle non-JSON responses and parse JSON safely
      const contentType = res.headers.get("content-type") || '';
      if (!contentType.includes("application/json")) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Unexpected response (${res.status})`);
      }

      const data = await res.json().catch(async (e) => {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || 'Failed to parse server response');
      });

      if (!res.ok) {
        throw new Error(data.message || `Failed to update profile (${res.status})`);
      }

      setUser(data.user);
      setIsEditing(false);
      setNewIdProof(null);
      setNewIdProofPreview("");

      // Update sessionStorage without large document data
      const {
        idProofDocument,
        idProofFileName,
        idProofFileType,
        ...userDataToStore
      } = data.user;
      sessionStorage.setItem("user", JSON.stringify(userDataToStore));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        icon: <Clock className="w-4 h-4" />,
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pending Approval",
      },
      Approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Approved",
      },
      Rejected: {
        icon: <XCircle className="w-4 h-4" />,
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C2E50] mx-auto"></div>
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
    <div className="min-h-screen bg-gray-100 py-8 px-4 mt-40">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log("Back button clicked");
            if (onBack) {
              onBack();
              console.log("Navigating to home");
            }
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
          }}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-[#0C2E50] hover:bg-[#0b2948] text-white rounded-lg transition-colors cursor-pointer shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#0C2E50] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(user?.status)}
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0C2E50] text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 " />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {updateLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updateLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 ">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0C2E50]" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user?.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Email Address
                </p>
                <p className="text-gray-900 font-semibold">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">
                  Mobile Number
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={editedData.mobile}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user?.mobile}</p>
                )}
              </div>
            </div>

            {/* Employee ID */}
            <div className="flex items-start gap-3">
              <IdCard className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Employee ID</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeId"
                    value={editedData.employeeId || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user?.employeeId || '—'}</p>
                )}
              </div>
            </div>

            {/* Designation */}
            <div className="flex items-start gap-3">
              <IdCard className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Designation</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="designation"
                    value={editedData.designation || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user?.designation || '—'}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Category</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="category"
                    value={editedData.category || ''}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 font-semibold">{user?.category || '—'}</p>
                )}
              </div>
            </div>

            {/* ID Proof */}
            <div className="flex items-start gap-3 md:col-span-2">
              <FileText className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  ID Proof Document
                </p>
                {isEditing ? (
                  <div>
                    <label className="flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                      <Upload className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate">
                        {newIdProofPreview ||
                          user?.idProofFileName ||
                          "Upload New ID Proof (JPG, PNG, PDF - Max 2MB)"}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {user?.idProofDocument && (
                      <p className="text-xs text-gray-500 mt-2">
                        Current: {user.idProofFileName || "Document uploaded"}
                      </p>
                    )}
                  </div>
                ) : user?.idProofDocument ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleViewDocument}
                      title="View Document"
                      className="p-2  text-black font-semibold rounded-lg inline-flex items-center justify-center transition cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <a
                      href={user.idProofDocument}
                      download={user.idProofFileName || "id-proof"}
                      className="px-4 py-2  text-black font-semibold rounded-lg inline-flex items-center gap-2 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No ID proof uploaded</p>
                )}
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-start gap-3 md:col-span-2">
              <Clock className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Member Since
                </p>
                <p className="text-gray-900 font-semibold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Status Information */}
          {user?.status === "Pending" && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">
                    Registration Pending
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your registration is currently under review by the
                    administrator. You will be notified once your account is
                    approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {user?.status === "Approved" && showApprovalMessage && (
            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg relative">
              <button
                onClick={() => setShowApprovalMessage(false)}
                className="absolute top-2 right-2 text-green-600 hover:text-green-800"
                aria-label="Close message"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-start gap-3 pr-8">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">
                    ✓ Profile Approved by AISCSSTEWA
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Congratulations! Your registration has been approved by the
                    administrator. You now have full access to all member
                    features and resources.
                  </p>
                </div>
              </div>
            </div>
          )}

          {user?.status === "Rejected" && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">
                    Registration Not Approved
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Unfortunately, your registration was not approved by the
                    administrator. Please contact support for more information
                    or to resubmit your application.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
