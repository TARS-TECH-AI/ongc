import React, { useMemo, useState, useEffect } from "react";
import { XCircle, CheckCircle, Trash2, Eye, FileText } from "lucide-react";
import Member1 from "../assets/Member1.png";
import Member2 from "../assets/Member2.png";
import Member3 from "../assets/Member3.png";

const sampleMembers = [

];

const Badge = ({ status }) => {
  const label = status === "Approved" ? "Active" : status === "Pending" ? "Inactive" : status;
  if (label === "Active")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
        <CheckCircle size={14} className="mr-2" />
        {label}
      </span>
    );
  if (label === "Rejected") return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
      <XCircle size={14} className="mr-2" />
      {label}
    </span>
  );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
      <XCircle size={14} className="mr-2" />
      {label}
    </span>
  );
};

const downloadCSV = (rows) => {
  const header = ["Name", "Email", "Phone", "Category", "Joined", "Status"];
  const csv = [
    header,
    ...rows.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.category,
      r.joined,
      r.status,
    ]),
  ]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "members.csv";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};

const Members = () => {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState(sampleMembers);
  const [selected, setSelected] = useState(null);
  const [loadingSelected, setLoadingSelected] = useState(false);

  const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${memberId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Delete failed');
      setMembers(prev => prev.filter(m => m.id !== memberId));
      if (selected && (selected.id === memberId || selected._id === memberId)) setSelected(null);
      alert('Member deleted');
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const loadMembers = async () => {
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed to load members');
      const data = await res.json();
      (data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      const mapped = (data || []).map(u => ({
        id: u.id || u._id,
        name: u.name,
        email: u.email,
        phone: u.mobile || u.phone,
        category: u.category,
        designation: u.designation,
        status: u.status,
        joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—',
        createdAt: u.createdAt,
        isNew: u.createdAt ? (Date.now() - new Date(u.createdAt).getTime()) <= 7*24*60*60*1000 : false,
        docs: u.documents || [],
        online: !!u.online,
        lastOnline: u.lastOnline || null
      }));
      setMembers(mapped);
    } catch (err) {
      console.warn('Load members failed', err);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const filtered = useMemo(() => {
    const val = q.trim().toLowerCase();
    if (!val) return members;
    return members.filter((m) => (m.name + (m.email||'') + (m.phone||'') + (m.category||'') + (m.designation||'')).toLowerCase().includes(val));
  }, [q, members]);

  const changeMemberStatus = async (id, status) => {
    if (!window.confirm(`Confirm set status to ${status}?`)) return;
    const old = members.find(m => m.id === id)?.status;
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('Status update failed');
      await loadMembers();
      alert('Status updated');
    } catch (err) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, status: old } : m));
      alert(err.message || 'Failed to update status');
    }
  };

  const openDetails = async (id) => {
    setSelected({ loading: true }); setLoadingSelected(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSelected({ ...data, loading: false });
    } catch (err) {
      setSelected({ error: err.message || 'Failed to load', loading: false });
    } finally { setLoadingSelected(false); }
  };

  const closeDetails = () => setSelected(null);

  const viewDocument = (docData, fileName) => {
    if (!docData) return;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName || "Document"}</title>
            <style>
              body { margin: 0; padding: 0; background: #f3f4f6; }
              iframe { width: 100vw; height: 100vh; border: none; }
              img { max-width: 100%; display: block; margin: 20px auto; }
            </style>
          </head>
          <body>
            ${
              docData.startsWith("data:image")
                ? `<img src="${docData}" alt="${fileName || "Document"}" />`
                : `<iframe src="${docData}"></iframe>`
            }
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const downloadDoc = (doc) => {
    if (doc.url) {
      let url = doc.url;
      if (url.startsWith("/")) {
        const base = API.replace(/\/api\/?$/, "");
        url = `${base}${url}`;
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert(`Download ${doc.name || 'document'}`);
    }
  };

  const total = members.length;
  const active = members.filter((m) => m.status === "Active").length;
  const inactive = members.filter((m) => m.status !== "Active").length;

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {total.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center overflow-hidden">
              <img
                src={Member1}
                alt="member"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Active Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {active.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
             <img
                src={Member2}
                alt="member"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Inactive Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {inactive.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <img
                src={Member3}
                alt="member"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 mb-4">
          <div className="w-full sm:w-1/2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Member...."
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="w-full sm:w-auto flex justify-end">
            <button
              onClick={() => downloadCSV(filtered)}
              className="bg-slate-900 text-white px-4 py-2 rounded"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table for md+ */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white border-b">
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Joining date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((m) => (
                <tr key={m.id} className="bg-white">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {m.name} {m.isNew && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">New</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{m.online ? <span className="text-emerald-700">Online</span> : (m.lastOnline ? `Last: ${new Date(m.lastOnline).toLocaleString()}` : 'Offline')}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>{m.designation}</div>
                    {/* <div className="text-xs text-slate-400 mt-1">{m.phone}</div> */}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {m.category}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {m.joined}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge status={m.status} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {/* <button onClick={() => openDetails(m.id)} className="text-sky-700 hover:underline">
                        View Details
                      </button> */}
                      <button 
                        onClick={() => handleDeleteMember(m.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition"
                        title="Remove Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{m.name} {m.isNew && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">New</span>}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.designation || '—'} • {m.category} • {m.joined}</div>
                  <div className="text-xs text-slate-500 mt-2">{m.email} • {m.phone}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.online ? <span className="text-emerald-700">Online</span> : (m.lastOnline ? `Last: ${new Date(m.lastOnline).toLocaleString()}` : 'Offline')}</div>
                </div>
                <Badge status={m.status} />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => openDetails(m.id)} className="text-sky-700 text-sm hover:underline">
                  View Details
                </button>
                <button 
                  onClick={() => handleDeleteMember(m.id)}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition"
                  title="Remove Member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Members;
