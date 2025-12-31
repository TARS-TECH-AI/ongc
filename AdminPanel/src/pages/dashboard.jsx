import React from "react";
import { User, Users, FileText, Bell } from "lucide-react";

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
  const [recentRegs, setRecentRegs] = React.useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      status: "Pending",
      tag: "Pending",
      date: "2024-01-15",
      group: "SC",
    },
    {
      id: 2,
      name: "Sunita Devi",
      status: "Approved",
      tag: "Approved",
      date: "2024-01-14",
      group: "ST",
    },
    {
      id: 3,
      name: "Priya Sharma",
      status: "Rejected",
      tag: "Rejected",
      date: "2024-01-15",
      group: "SC",
    },
    {
      id: 4,
      name: "Sunita Devi",
      status: "Approved",
      tag: "Approved",
      date: "2024-01-14",
      group: "ST",
    },
  ]);
  const [loadingRecent, setLoadingRecent] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [showAll, setShowAll] = React.useState(false);

  // stats
  const [usersCount, setUsersCount] = React.useState(null);
  const [pendingCount, setPendingCount] = React.useState(null);
  const [docsCount, setDocsCount] = React.useState(null);
  const [loadingStats, setLoadingStats] = React.useState(false);

  const [selectedUser, setSelectedUser] = React.useState(null);

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
    setSelectedUser({ loading: true });
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSelectedUser({ ...data, loading: false });
    } catch (err) {
      const fallback = allRegs.find(u => u.id === id);
      setSelectedUser({ ...(fallback || {}), loading: false });
    }
  };

  const closeDetails = () => setSelectedUser(null);

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
    } catch (err) {
      alert(err.message || 'Failed to update status');
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
                  {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
                      <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={closeDetails} />

                      <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-lg font-semibold">User Details</h2>
                          <button onClick={closeDetails} className="text-slate-600">✕</button>
                        </div>

                        {selectedUser.loading ? (
                          <div className="py-8 text-center text-sm text-slate-600">Loading details…</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-slate-500">Full Name</div>
                                <div className="font-medium text-slate-800">{selectedUser.name}</div>

                                <div className="mt-3 text-sm text-slate-500">Phone</div>
                                <div className="font-medium text-slate-800">{selectedUser.phone || '—'}</div>

                                <div className="mt-3 text-sm text-slate-500">Registration Date</div>
                                <div className="font-medium text-slate-800">{selectedUser.date ? new Date(selectedUser.date).toLocaleDateString() : ''}</div>
                              </div>

                              <div>
                                <div className="text-sm text-slate-500">Email</div>
                                <div className="font-medium text-slate-800">{selectedUser.email || ''}</div>

                                <div className="mt-3 text-sm text-slate-500">Category</div>
                                <div className="font-medium text-slate-800">{selectedUser.category || selectedUser.group}</div>

                                <div className="mt-3 text-sm text-slate-500">Status</div>
                                <div className="mt-2"><span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{selectedUser.status}</span></div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <h3 className="text-sm font-semibold mb-2">Uploaded Documents</h3>
                              <div className="space-y-2">
                                {selectedUser.docs && selectedUser.docs.length ? selectedUser.docs.map(d => (
                                  <div key={d.url || d.name} className="flex items-center justify-between bg-slate-100 rounded p-3">
                                    <div className="text-sm">{d.name}</div>
                                    <div className="flex items-center gap-3">
                                      <a href={d.url && d.url.startsWith('/') ? `${API.replace(/\/api\/?$/,'')}${d.url}` : d.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-amber-200 text-amber-900 rounded">Open</a>
                                    </div>
                                  </div>
                                )) : <div className="text-sm text-slate-500">No documents uploaded</div>}
                              </div>
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                              <button onClick={() => changeStatus(selectedUser.id, 'Approved')} className="px-6 py-2 bg-slate-900 text-white rounded">Approve</button>
                              <button onClick={() => changeStatus(selectedUser.id, 'Rejected')} className="px-6 py-2 bg-rose-600 text-white rounded">Reject</button>
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
