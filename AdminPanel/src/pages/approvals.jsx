import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';

const sample = [
  { id: 1, name: 'Rajesh Kumar', category: 'SC', date: '5/19/12', status: 'Rejected' },
  { id: 2, name: 'Sunita Devi', category: 'SC', date: '5/27/15', status: 'Approved' },
  { id: 3, name: 'Priya Sharma', category: 'ST', date: '10/28/12', status: 'Approved' },
  { id: 4, name: 'Sunita Devi', category: 'SC', date: '8/2/19', status: 'Pending' },
  { id: 5, name: 'Rajesh Kumar', category: 'SC', date: '9/23/16', status: 'Rejected' },
  { id: 6, name: 'Rajesh Kumar', category: 'ST', date: '6/21/19', status: 'Approved' },
  { id: 7, name: 'Rajesh Kumar', category: 'ST', date: '6/21/19', status: 'Pending' },
  { id: 8, name: 'Rajesh Kumar', category: 'ST', date: '6/21/19', status: 'Pending' },
  { id: 9, name: 'Rajesh Kumar', category: 'ST', date: '6/21/19', status: 'Approved' },
  { id: 10, name: 'Sunita Devi', category: 'ST', date: '6/21/19', status: 'Rejected' },
];

const docsMap = {
  1: [ { id: 'a1', name: 'SC Certificate', file: null }, { id: 'a2', name: 'Aadhar Card', file: null } ],
  4: [ { id: 'd1', name: 'ID Proof.pdf', file: null } ],
  7: [ { id: 'd2', name: 'Residence.pdf', file: null } ],
};

const StatusBadge = ({ status }) => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  if (status === 'Approved') return <span className={`${base} bg-sky-900 text-white`}>{status}</span>;
  if (status === 'Rejected') return <span className={`${base} bg-rose-600 text-white`}>{status}</span>;
  return <span className={`${base} bg-amber-300 text-amber-900`}>{status}</span>;
};

const Approvals = () => {
  const [rows, setRows] = useState(sample);
  const [selected, setSelected] = useState(null);
  const [loadingRows, setLoadingRows] = useState(false);

  const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

  // load users (pending by default)
  const loadRows = async () => {
    setLoadingRows(true);
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals?status=Pending`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const mapped = data.map(u => ({ id: u.id || u._id, name: u.name, category: u.category, date: new Date(u.date || u.createdAt).toLocaleDateString(), status: u.status }));
      setRows(mapped);
    } catch (err) {
      // keep sample as fallback
      console.warn('Failed to load approvals', err.message || err);
    } finally {
      setLoadingRows(false);
    }
  };

  React.useEffect(() => { loadRows(); }, []);

  const openDetails = async (row) => {
    setSelected({ loading: true });
    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${row.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json().catch(() => ({}));
      // expect data: { id, name, category, date, status, phone, email, docs: [{id,name,url}] }
      setSelected({ ...data, docs: data.docs || docsMap[row.id] || [] });
    } catch (err) {
      // fallback to local sample data
      setSelected({ ...row, docs: docsMap[row.id] || [], loading: false });
    }
  };

  const closeDetails = () => setSelected(null);

  const changeStatus = async (id, newStatus) => {
    // capture old status to revert if needed
    let old;
    setRows(prev => {
      const next = prev.map(r => {
        if (r.id === id) { old = r.status; return { ...r, status: newStatus }; }
        return r;
      });
      return next;
    });

    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Status update failed');
      }
      // refresh list from server
      await loadRows();
      closeDetails();
    } catch (err) {
      // revert on failure
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: old } : r));
      alert(err.message || 'Failed to update status');
    }
  };

  const approve = (id) => changeStatus(id, 'Approved');
  const reject = (id) => changeStatus(id, 'Rejected');

  const downloadDoc = (doc) => {
    if (doc.url) {
      let url = doc.url;
      // if server-relative path, prefix API base
      if (url.startsWith('/')) {
        const base = API.replace(/\/api\/?$/, '');
        url = `${base}${url}`;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert(`Download ${doc.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Desktop table */}
        {loadingRows ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-slate-600">Loading approvals...</div>
        ) : (
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={row.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => openDetails(row)} className="text-sky-700 hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile list */}
        <div className="md:hidden space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800">{row.name}</div>
                <div className="text-xs text-slate-500">{row.category} • {row.date}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={row.status} />
                <button onClick={() => openDetails(row)} className="text-sky-700 text-sm hover:underline">View Details</button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={closeDetails} />

            <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold">User Details</h2>
                <button onClick={closeDetails} className="text-slate-600">✕</button>
              </div>

              {selected.loading ? (
                <div className="py-8 text-center text-sm text-slate-600">Loading details…</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Full Name</div>
                      <div className="font-medium text-slate-800">{selected.name}</div>

                      <div className="mt-3 text-sm text-slate-500">Phone</div>
                      <div className="font-medium text-slate-800">{selected.phone || '+91 9876543210'}</div>

                      <div className="mt-3 text-sm text-slate-500">Registration Date</div>
                      <div className="font-medium text-slate-800">{selected.date}</div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-500">Email</div>
                      <div className="font-medium text-slate-800">{selected.email || (selected.name ? selected.name.split(' ').join('.').toLowerCase() + '@email.com' : '')}</div>

                      <div className="mt-3 text-sm text-slate-500">Category</div>
                      <div className="font-medium text-slate-800">{selected.category}</div>

                      <div className="mt-3 text-sm text-slate-500">Status</div>
                      <div className="mt-2"><StatusBadge status={selected.status} /></div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2">Uploaded Documents</h3>
                    <div className="space-y-2">
                      {selected.docs && selected.docs.length ? selected.docs.map(d => (
                        <div key={d.id} className="flex items-center justify-between bg-slate-100 rounded p-3">
                          <div className="text-sm">{d.name}</div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => downloadDoc(d)} className="px-3 py-1 bg-amber-200 text-amber-900 rounded">Download</button>
                            <button onClick={() => downloadDoc(d)} className="text-slate-600"><Download size={16} /></button>
                          </div>
                        </div>
                      )) : <div className="text-sm text-slate-500">No documents uploaded</div>}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <button onClick={() => approve(selected.id)} className="px-6 py-2 bg-slate-900 text-white rounded">Approved</button>
                    <button onClick={() => reject(selected.id)} className="px-6 py-2 bg-rose-600 text-white rounded">Rejected</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Approvals;
