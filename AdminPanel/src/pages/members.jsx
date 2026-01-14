import React, { useMemo, useState, useEffect } from "react";
import { XCircle, CheckCircle, Trash2, Eye, FileText } from "lucide-react";
import Member1 from "../assets/Member1.png";
import Member2 from "../assets/Member2.png";
import Member3 from "../assets/Member3.png";

// Import static lists (local copies)
import cwcMembers from "../data/cwcMember";
import cecMembers from "../data/cecMembers";

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

const downloadCSV = (rows, filename = 'members.csv') => {
  // Export exactly the displayed fields: Name, Post In Association, Unit, CPF No, Category
  const header = ["Name", "Post In Association", "Unit", "CPF No", "Category"];
  const csv = [
    header,
    ...rows.map((r) => {
      const name = r.name || r.Name || '';
      const post = r.postInAssociation || r.post || r.designation || '';
      const unit = r.unit || r.Unit || '';
      const cpf = (r.cpfNo || r.cpf || '').toString();
      const category = (r.category || r.type || '').toString();
      return [name, post, unit, cpf, category];
    }),
  ]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // ensure filename ends with .csv
  if (!filename.toLowerCase().endsWith('.csv')) filename += '.csv';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};

const Members = () => {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState(sampleMembers);
  const [cwcList, setCwcList] = useState([]);
  const [cecList, setCecList] = useState([]);
  const [activeType, setActiveType] = useState('all'); // 'cwc' | 'cec' | 'all'
  const [selected, setSelected] = useState(null);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // { id, member }
  const [form, setForm] = useState({ name: '', postInAssociation: '', unit: '', cpfNo: '', type: 'CWC' });
  const [exportScope, setExportScope] = useState('all');
  const getDefaultFilename = (scope) => {
    const s = scope || 'all';
    const ts = new Date().toISOString().slice(0,16).replace(/:/g,'').replace('T','-');
    return `members-${s}-${ts}.csv`;
  };
  const [saving, setSaving] = useState(false);

  const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

  const handleDeleteMember = async (memberId) => {
    // Prevent deleting static members
    if (String(memberId).startsWith('static-')) return alert('Cannot delete static CWC/CEC members from here');
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const token = sessionStorage.getItem('admin-token');
      let res;

      // If this looks like a Mongo ObjectId, delete from members collection
      if (/^[a-f\d]{24}$/i.test(memberId)) {
        res = await fetch(`${API}/members/${memberId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      } else {
        // Fallback: approvals (users)
        res = await fetch(`${API}/admin/approvals/${memberId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      }

      if (!res.ok) {
        // Try read body for a helpful message
        const text = await res.text();
        throw new Error((text && text.trim()) || 'Delete failed');
      }

      // reload members to ensure UI matches backend
      await loadMembers();
      if (selected && (selected.id === memberId || selected._id === memberId)) setSelected(null);
      alert('Member deleted');
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  // Save (create or edit) member - robust parsing for non-JSON responses
  const handleSaveMember = async () => {
    if (!form.name || !form.cpfNo) return alert('Name and CPF are required');
    try {
      if (saving) return; // prevent double submits
      setSaving(true);
      const token = sessionStorage.getItem('admin-token');
      let res;

      if (editing && !String(editing.id).startsWith('static-')) {
        res = await fetch(`${API}/members/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) });
      } else {
        res = await fetch(`${API}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(form) });
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      let data = null;

      if (contentType.includes('application/json')) {
        try { data = await res.json(); } catch (e) { data = null; }
      } else {
        const text = await res.text();
        // If server returned HTML (like a 404 page), include helpful message
        if (text && text.trim().startsWith('<')) {
          throw new Error(`Server returned HTML ${res.status} ${res.statusText}. Check backend deployment or VITE_API_URL=${API}`);
        }
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      }

      if (!res.ok) {
        const errMsg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
        throw new Error(errMsg);
      }

      const member = data && data.member;
      const normalize = (memb) => ({ id: memb._id || memb.id, name: memb.name, postInAssociation: memb.postInAssociation || memb.designation || '', unit: memb.unit || '', cpfNo: memb.cpfNo || '', category: memb.type || memb.category || '', createdAt: memb.createdAt });

      // Refresh authoritative data from backend to avoid duplicates and ensure persistence
      await loadMembers();

      setShowAdd(false); setEditing(null); setForm({ name: '', postInAssociation: '', unit: '', cpfNo: '', type: 'CWC' });
      alert('Saved');
    } catch (err) {
      console.error('Save failed', err);
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const loadMembers = async () => {
    try {
      // Use original static lists only (do not fetch or sync with backend)
      const map = (arr, category) => (arr || []).map((u, idx) => ({
        id: `static-${category}-${idx}`,
        name: u.name || u.Name || '—',
        email: '',
        phone: u.phone || u.mobile || '',
        category: category.toUpperCase(),
        postInAssociation: u.postInAssociation || u.designation || '—',
        unit: u.Unit || u.unit || '',
        cpfNo: (u.cpfNo || u.cpf || '').toString(),
        status: 'Active',
        joined: '—',
        createdAt: null,
        isNew: false,
        docs: [],
        online: false,
        lastOnline: null
      }));

      const cwc = map(cwcMembers, 'CWC');
      const cec = map(cecMembers, 'CEC');
      setCwcList(cwc);
      setCecList(cec);
      const combined = [...cwc, ...cec];
      setMembers(combined);
    } catch (err) {
      console.warn('Load members failed', err);
    }
  };

  useEffect(() => { loadMembers(); }, []);

  const displayMembers = activeType === 'cwc' ? cwcList : activeType === 'cec' ? cecList : members;

  const filtered = useMemo(() => {
    const val = q.trim().toLowerCase();
    if (!val) return displayMembers;
    return displayMembers.filter((m) => (m.name + (m.email||'') + (m.phone||'') + (m.postInAssociation||'') + (m.unit||'') + (m.cpfNo||'')).toLowerCase().includes(val));
  }, [q, displayMembers]);

  const changeMemberStatus = async (id, status) => {
    // Prevent modifying static members
    if (String(id).startsWith('static-')) return alert('Cannot change status for static CWC/CEC members');
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
    // If this is a static CWC/CEC row, show local details
    if (String(id).startsWith('static-')) {
      const m = [...cwcList, ...cecList].find(x => x.id === id);
      setSelected(m ? { ...m, loading: false } : { error: 'Not found', loading: false });
      // open edit for static rows
      setEditing(m ? { id: m.id, member: m } : null);
      setForm(m ? { name: m.name, postInAssociation: m.postInAssociation || m.designation || '', unit: m.unit, cpfNo: m.cpfNo, type: m.category || m.type } : form);
      setShowAdd(true);
      return;
    }

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

  const total = (cwcList.length || 0) + (cecList.length || 0);
  const active = (cwcList.filter((m) => m.status === "Active").length || 0) + (cecList.filter((m) => m.status === "Active").length || 0);
  const inactive = total - active;

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
              <div className="text-sm text-slate-500">CEC Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {(cecList.length || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
             <img
                src={Member2}
                alt="cec"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">CWC Members</div>
              <div className="text-2xl font-bold text-slate-900">
                {(cwcList.length || 0).toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <img
                src={Member3}
                alt="cwc"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 mb-4">
          <div className="w-full sm:w-1/3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Member...."
              className="w-full max-w-lg border rounded px-3 py-2"
            />
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row items-center md:items-start md:justify-end gap-2">
            <div className="w-full grid grid-cols-2 gap-2 md:flex md:flex-row md:items-center md:w-auto md:gap-2">
              <button
                onClick={() => setActiveType('cwc')}
                className={`px-3 py-2 rounded ${activeType === 'cwc' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                CWC Members ({cwcList.length || 0})
              </button>
              <button
                onClick={() => setActiveType('cec')}
                className={`px-3 py-2 rounded ${activeType === 'cec' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
                CEC Members ({cecList.length || 0})
              </button>
              <button
                onClick={() => setActiveType('all')}
                className={`px-2 py-2 rounded text-sm ${activeType === 'all' ? 'bg-slate-900 text-white' : 'bg-white border'}`}>
                All
              </button>

              <button
                onClick={() => setShowAdd(true)}
                className="ml-2 px-3 py-2 bg-emerald-600 text-white rounded"
              >
                Add Member
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <select value={exportScope} onChange={(e) => { setExportScope(e.target.value); }} className="border rounded px-2 py-1 bg-white text-sm w-full md:w-auto">
                <option value="all">All</option>
                <option value="cwc">CWC Members</option>
                <option value="cec">CEC Members</option>
              </select>

              <button
                onClick={() => {
                  // Export exactly what is visible (respect search/filter)
                  const rows = exportScope === 'cwc' ? filtered.filter(m => (m.category || m.type || '').toString().toUpperCase() === 'CWC') : exportScope === 'cec' ? filtered.filter(m => (m.category || m.type || '').toString().toUpperCase() === 'CEC') : filtered;
                  if (!rows || rows.length === 0) return alert('No members to export for selected scope');
                  downloadCSV(rows, getDefaultFilename(exportScope));
                }}
                className="bg-slate-900 text-white px-3 py-2 rounded w-full md:w-auto"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Table for md+ */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white border-b">
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Post In Association
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  CPF No
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

                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {m.name} {m.isNew && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">New</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>{m.postInAssociation || m.designation}</div>
                    {/* <div className="text-xs text-slate-400 mt-1">{m.phone}</div> */}
                  </td>

                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {m.unit || '—'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {m.cpfNo || '—'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing({ id: m.id, member: m }); setForm({ name: m.name, postInAssociation: m.postInAssociation || m.designation || '', unit: m.unit, cpfNo: m.cpfNo, type: m.category || m.type || 'CWC' }); setShowAdd(true); }} className="text-slate-700 p-2 hover:bg-slate-50 rounded-lg transition" title="Edit Member">
                        <FileText size={18} />
                      </button>
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
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              onClick={() => openDetails(m.id)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">

                  <div>
                    <div className="text-sm font-medium text-slate-800">{m.name} {m.isNew && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">New</span>}</div>
                    <div className="text-xs text-slate-500 mt-1">{m.postInAssociation || m.designation || '—'} — Unit: {m.unit || '—'}</div>
                    <div className="text-xs text-slate-500 mt-2">{m.email}{m.email && m.phone ? ' / ' : ''}{m.phone}</div>
                    <div className="text-xs text-slate-500 mt-1">CPF: {m.cpfNo || '—'}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ id: m.id, member: m });
                    setForm({ name: m.name, postInAssociation: m.postInAssociation || m.designation || '', unit: m.unit, cpfNo: m.cpfNo, type: m.category || m.type || 'CWC' });
                    setShowAdd(true);
                  }}
                  className="text-slate-700 p-1 hover:bg-slate-50 rounded transition"
                  title="Edit Member"
                >
                  <FileText size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteMember(m.id); }}
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

        {/* Add / Edit modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="bg-white rounded p-6 w-full max-w-md max-h-[90vh] overflow-auto">
              <h3 className="font-bold mb-3">{editing ? 'Edit Member' : 'Add Member'}</h3>
              <div className="space-y-2">
                <input className="w-full border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                <input className="w-full border px-3 py-2" placeholder="Post In Association" value={form.postInAssociation} onChange={(e) => setForm(f => ({ ...f, postInAssociation: e.target.value }))} />
                <input className="w-full border px-3 py-2" placeholder="Unit" value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} />
                <input className="w-full border px-3 py-2" placeholder="CPF No" value={form.cpfNo} onChange={(e) => setForm(f => ({ ...f, cpfNo: e.target.value }))} />
                <select className="w-full border px-3 py-2" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="CWC">CWC</option>
                  <option value="CEC">CEC</option>
                </select>
                <div className="flex justify-end gap-2 mt-4">
                  <button className="px-3 py-2 border rounded" onClick={() => { setShowAdd(false); setEditing(null); setForm({ name: '', postInAssociation: '', unit: '', cpfNo: '', type: 'CWC' }); }}>Cancel</button>
                  <button className={`px-3 py-2 rounded ${saving ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-900 text-white'}`} onClick={handleSaveMember} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default Members;
