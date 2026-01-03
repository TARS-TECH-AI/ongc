import React from "react";
import { User, Users, FileText, Bell, Eye } from "lucide-react";

const stats = [
  {
    key: "users",
    label: "Total Registered Users",
    value: "1248",
    icon: <User size={20} className="text-white" />,
    bg: "bg-sky-700",
  },
  {
    key: "approvals",
    label: "Pending Approvals",
    value: "47",
    icon: <Users size={20} className="text-white" />,
    bg: "bg-amber-500",
  },
  {
    key: "docs",
    label: "Documents",
    value: "116",
    icon: <FileText size={20} className="text-white" />,
    bg: "bg-slate-700",
  },
  {
    key: "updates",
    label: "Updates Published",
    value: "45",
    icon: <Bell size={20} className="text-white" />,
    bg: "bg-slate-900",
  },
];

const pageSize = 10;
const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

const recentUpdates = [
  { id: 1, title: "Annual General Meeting Notice", date: "2024-01-15" },
  { id: 2, title: "Unit Secretary Elections", date: "2024-01-10" },
  { id: 3, title: "New Membership Guidelines", date: "2024-01-10" },
  { id: 4, title: "Announcement published", date: "1 day ago" },
];

const Dashboard = () => {
  const [allRegs, setAllRegs] = React.useState([]);
  const [recentRegs, setRecentRegs] = React.useState([]);
  const [loadingRecent, setLoadingRecent] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [showAll, setShowAll] = React.useState(false);

  // stats
  const [usersCount, setUsersCount] = React.useState(null);
  const [pendingCount, setPendingCount] = React.useState(null);
  const [docsCount, setDocsCount] = React.useState(null);
  const [loadingStats, setLoadingStats] = React.useState(false);

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userDetails, setUserDetails] = React.useState(null);
  const [showUserModal, setShowUserModal] = React.useState(false);

  const loadOverview = async () => {
    setLoadingRecent(true);
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      const mappedAll = (data || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(u => ({ id: u.id || u._id, name: u.name, email: u.email, phone: u.phone, status: u.status || 'Pending', tag: u.status || 'Pending', date: new Date(u.createdAt).toLocaleDateString(), group: u.category || '', docs: u.documents || [], createdAt: u.createdAt }));

      setAllRegs(mappedAll);
      setRecentRegs(mappedAll.slice(0, 4));

      setUsersCount(mappedAll.length);
      setPendingCount(mappedAll.filter(u => u.status === 'Pending').length);
      setDocsCount(mappedAll.reduce((acc, u) => acc + (u.docs ? u.docs.length : 0), 0));
    } catch (err) {
      console.warn('Failed to load overview', err.message || err);
    } finally {
      setLoadingRecent(false);
      setLoadingStats(false);
    }
  };

  React.useEffect(() => { loadOverview(); }, []);

  const totalPages = Math.max(1, Math.ceil(allRegs.length / pageSize));
  const displayRegs = showAll ? allRegs.slice((page - 1) * pageSize, page * pageSize) : recentRegs;
  const statsValues = {
    users: usersCount !== null ? usersCount : '—',
    approvals: pendingCount !== null ? pendingCount : '—',
    docs: docsCount !== null ? docsCount : '—',
    updates: 45,
  };

  const openDetails = async (id) => {
    setShowUserModal(true);
    setUserDetails({ loading: true });
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setUserDetails({ ...data, loading: false });
    } catch (err) {
      const fallback = allRegs.find(u => u._id === id || u.id === id);
      setUserDetails({ ...(fallback || {}), loading: false, error: err.message });
    }
  };

  const closeDetails = () => {
    setShowUserModal(false);
    setUserDetails(null);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Status update failed');
      }
      await loadOverview();
      closeDetails();
      alert(`User status updated to ${newStatus} successfully!`);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const viewDocument = (docData, fileName) => {
    if (!docData) return;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName || 'Document'}</title>
            <style>
              body { margin: 0; padding: 0; background: #f3f4f6; }
              iframe { width: 100vw; height: 100vh; border: none; }
              img { max-width: 100%; display: block; margin: 20px auto; }
            </style>
          </head>
          <body>
            ${docData.startsWith('data:image') 
              ? `<img src="${docData}" alt="${fileName || 'Document'}" />` 
              : `<iframe src="${docData}"></iframe>`
            }
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div
              key={s.key}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${s.bg} w-10 h-10 rounded-full flex items-center justify-center`}
                >
                  {s.icon}
                </div>
                <div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {statsValues[s.key] ?? s.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Recent Registrations
              </h3>
              <a className="text-sm text-slate-600 hover:underline">View All</a>
            </div>

            <div className="space-y-3">
              {loadingRecent ? (
                <div className="py-6 text-center text-sm text-slate-600">Loading recent registrations...</div>
              ) : (
                <>
                  {displayRegs.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">{r.name ? r.name.charAt(0) : 'U'}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{r.name}</div>
                          <div className="text-xs text-slate-500">{r.group} • {r.date}</div>
                          <div className="text-xs text-slate-500">{r.email || ''}{r.phone ? ' • ' + r.phone : ''}</div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${r.status === "Approved" ? "bg-emerald-100 text-emerald-700" : r.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{r.tag}</span>

                        <button onClick={() => openDetails(r.id)} className="text-sky-700 hover:underline text-sm">View Details</button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <button onClick={() => { setShowAll(prev => !prev); setPage(1); }} className="text-sm text-slate-600 hover:underline">{showAll ? 'Show Top 4' : 'View All'}</button>
                    </div>

                    {showAll && (
                      <div className="flex items-center gap-2 text-sm">
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-slate-100">Prev</button>
                        <div className="px-2">Page {page} / {totalPages}</div>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-2 py-1 rounded bg-slate-100">Next</button>
                      </div>
                    )}
                  </div>

                  {/* Details Modal */}
                  {showUserModal && userDetails && (
                    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
                      <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={closeDetails} />

                      <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 my-8">
                        <div className="flex items-start justify-between mb-6">
                          <h2 className="text-xl font-bold text-slate-900">User Details</h2>
                          <button onClick={closeDetails} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">✕</button>
                        </div>

                        {userDetails.loading ? (
                          <div className="py-8 text-center text-sm text-slate-600">Loading details…</div>
                        ) : userDetails.error ? (
                          <div className="py-8 text-center text-sm text-red-600">{userDetails.error}</div>
                        ) : (
                          <>
                            {/* Personal Information */}
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b pb-2">Personal Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <div className="text-sm text-slate-500 mb-1">Full Name</div>
                                    <div className="font-semibold text-slate-900">{userDetails.name || '—'}</div>
                                  </div>

                                  <div>
                                    <div className="text-sm text-slate-500 mb-1">Email Address</div>
                                    <div className="font-medium text-slate-900 break-all">{userDetails.email || '—'}</div>
                                  </div>

                                <div>
                                  <div className="text-sm text-slate-500 mb-1">Mobile Number</div>
                                  <div className="font-medium text-slate-900">{userDetails.mobile || userDetails.phone || '—'}</div>
                                </div>

                                <div>
                                  <div className="text-sm text-slate-500 mb-1">Registration Date</div>
                                  <div className="font-medium text-slate-900">{userDetails.date ? new Date(userDetails.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
                                </div>
                              </div>

                                <div className="space-y-4">
                                  <div>
                                    <div className="text-sm text-slate-500 mb-1">Employee ID</div>
                                    <div className="font-semibold text-slate-900">{userDetails.employeeId || '—'}</div>
                                  </div>

                                  <div>
                                    <div className="text-sm text-slate-500 mb-1">User ID</div>
                                    <div className="font-mono text-sm text-slate-700">{userDetails.id || userDetails._id || '—'}</div>
                                  </div>

                                  <div>
                                    <div className="text-sm text-slate-500 mb-1">Registration Date</div>
                                    <div className="font-medium text-slate-900">
                                      {userDetails.date || userDetails.createdAt ? new Date(userDetails.date || userDetails.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : '—'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status Information */}
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b pb-2">Account Status</h3>
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="text-sm text-slate-500 mb-2">Current Status</div>
                                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                                    userDetails.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                    userDetails.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {userDetails.status || 'Pending'}
                                  </span>
                                </div>
                                {userDetails.category && (
                                  <div>
                                    <div className="text-sm text-slate-500 mb-2">Category</div>
                                    <div className="font-medium text-slate-900">{userDetails.category}</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t pt-6 mb-6">
                              <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b pb-2">Documents</h3>
                              
                              {/* ID Proof Document */}
                              <div className="mb-6">
                                <h4 className="text-md font-semibold mb-3 text-slate-800">ID Proof Document</h4>
                                {userDetails.idProofDocument ? (
                                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                        <div>
                                          <div className="font-medium text-slate-900">{userDetails.idProofFileName || 'ID Proof Document'}</div>
                                          <div className="text-sm text-slate-500">{userDetails.idProofFileType || 'Document'}</div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => viewDocument(userDetails.idProofDocument, userDetails.idProofFileName || 'ID Proof')}
                                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                        >
                                          <Eye size={16} />
                                          View
                                        </button>
                                        <a 
                                          href={userDetails.idProofDocument} 
                                          download={userDetails.idProofFileName || 'id-proof'}
                                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-slate-500 py-4 bg-slate-50 rounded-lg text-center border border-slate-200">No ID proof document uploaded</div>
                                )}
                              </div>

                              {/* Additional Documents */}
                              <div>
                                <h4 className="text-md font-semibold mb-3 text-slate-800">Additional Documents ({userDetails.docs?.length || 0})</h4>
                                <div className="space-y-2">
                                  {userDetails.docs && userDetails.docs.length ? userDetails.docs.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
                                      <div className="flex items-center gap-3 flex-1">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                        <div className="flex-1">
                                          <div className="font-medium text-slate-900">{d.name || 'Document'}</div>
                                          {d.uploadedAt && (
                                            <div className="text-xs text-slate-500">Uploaded: {new Date(d.uploadedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => viewDocument(d.url && d.url.startsWith('/') ? `${API.replace(/\/api\/?$/,'')}${d.url}` : d.url, d.name || 'Document')}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-medium"
                                      >
                                        <Eye size={16} />
                                        View
                                      </button>
                                    </div>
                                  )) : <div className="text-sm text-slate-500 py-4 bg-slate-50 rounded-lg text-center border border-slate-200">No additional documents uploaded</div>}
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-6 flex items-center gap-4">
                              <button 
                                onClick={() => changeStatus(userDetails.id, 'Approved')} 
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                              >
                                Approve User
                              </button>
                              <button 
                                onClick={() => changeStatus(userDetails.id, 'Rejected')} 
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                              >
                                Reject User
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Recent Updates
              </h3>
              <a className="text-sm text-slate-600 hover:underline">View All</a>
            </div>

            <div className="divide-y">
              {recentUpdates.map((u) => (
                <div key={u.id} className="py-3 flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-slate-900 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {u.title}
                    </div>
                    <div className="text-xs text-slate-500">{u.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 