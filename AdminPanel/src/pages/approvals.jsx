import React, { useState } from 'react';
import { Download, Eye, FileText, Search, Filter } from 'lucide-react';



const StatusBadge = ({ status }) => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  if (status === 'Approved') return <span className={`${base} bg-sky-900 text-white`}>{status}</span>;
  if (status === 'Rejected') return <span className={`${base} bg-rose-600 text-white`}>{status}</span>;
  return <span className={`${base} bg-amber-300 text-amber-900`}>{status}</span>;
};

const Approvals = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadError, setLoadError] = useState(null);

  const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

  // load users (all users, not just pending)
  const handleAdminUnauthorized = () => {
    // clear admin session and prompt login
    sessionStorage.removeItem('admin-token');
    alert('Admin session expired or unauthorized. Please login again.');
    // reload to show login UI or navigate to admin login route
    window.location.reload();
  };

  const loadRows = async (status = '') => {
    setLoadingRows(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      const queryParam = status && status !== 'All' ? `?status=${status}` : '';
      const res = await fetch(`${API}/admin/approvals${queryParam}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) {
        if (res.status === 401) return handleAdminUnauthorized();
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to fetch (${res.status})`);
      }
      const data = await res.json();
      const mapped = data.map(u => ({ id: u.id || u._id, name: u.name, email: u.email, mobile: u.mobile, employeeId: u.employeeId, date: new Date(u.date || u.createdAt).toLocaleDateString(), status: u.status }));
      setRows(mapped);
    } catch (err) {
      console.warn('Failed to load approvals', err.message || err);
      setRows([]);
      setLoadError(err.message || 'Failed to load approvals');
    } finally {
      setLoadingRows(false);
    }
  };

  React.useEffect(() => { loadRows(); }, []);

  const openDetails = async (row) => {
    setSelected({ loading: true });
    try {
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${row.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) {
        if (res.status === 401) return handleAdminUnauthorized();
        throw new Error(`Not found (${res.status})`);
      }
      const data = await res.json().catch(() => ({}));
      // expect comprehensive data: id, name, email, mobile, employeeId, status, date, createdAt, idProofDocument, idProofFileName, idProofFileType, docs
      setSelected({ 
        ...data, 
        docs: data.docs || [],
        loading: false,
        error: null
      });
    } catch (err) {
      // show available row info and error message
      setSelected({ ...row, docs: [], loading: false, error: err.message || 'Failed to load details' });
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
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/admin/approvals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        if (res.status === 401) return handleAdminUnauthorized();
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Status update failed (${res.status})`);
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

  // Filter and search logic
  const filteredRows = rows.filter(row => {
    const matchesSearch = searchQuery.trim() === '' || 
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.mobile?.includes(searchQuery) ||
      row.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleFilterChange = (status) => {
    setStatusFilter(status);
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, mobile or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-slate-600">
            Showing {filteredRows.length} of {rows.length} users
          </div>

          {loadError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded flex items-center justify-between">
              <div>Failed to load users: {loadError}</div>
              <div>
                <button onClick={() => { setLoadError(null); loadRows(); }} className="px-3 py-1 bg-white border rounded">Retry</button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop table */}
        {loadingRows ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-slate-600">Loading approvals...</div>
        ) : (
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y">
              <thead>
                <tr className="bg-white">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.employeeId || '-'}</td>
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
          {filteredRows.map((row) => (
            <div key={row.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800">{row.name}</div>
                <div className="text-xs text-slate-500">{row.email || '-'}</div>
                <div className="text-xs text-slate-500">{row.employeeId || '-'} • {row.category} • {row.date}</div>
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

            <div className="relative z-50 w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">User Details</h2>
                <button onClick={closeDetails} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">✕</button>
              </div>

              {selected.loading ? (
                <div className="py-8 text-center text-sm text-slate-600">Loading details…</div>
              ) : (
                <>
                  {selected.error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded">Failed to load full details: {selected.error}</div>
                  )}

                  {/* Personal Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Full Name</div>
                          <div className="font-semibold text-slate-900">{selected.name || '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-500 mb-1">Email Address</div>
                          <div className="font-medium text-slate-900 break-all">{selected.email || (selected.name ? selected.name.split(' ').join('.').toLowerCase() + '@email.com' : '—')}</div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-500 mb-1">Mobile Number</div>
                          <div className="font-medium text-slate-900">{selected.mobile || selected.phone || '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-500 mb-1">Address</div>
                          <div className="font-medium text-slate-900 break-words">{selected.address || '—'}</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Employee ID</div>
                          <div className="font-semibold text-slate-900">{selected.employeeId || '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-500 mb-1">User ID</div>
                          <div className="font-mono text-sm text-slate-700">{selected.id || selected._id || '—'}</div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-500 mb-1">Registration Date</div>
                          <div className="font-medium text-slate-900">
                            {selected.date || selected.createdAt ? new Date(selected.date || selected.createdAt).toLocaleDateString('en-US', { 
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
                        <StatusBadge status={selected.status} />
                      </div>
                      {selected.category && (
                        <div>
                          <div className="text-sm text-slate-500 mb-2">Category</div>
                          <div className="font-medium text-slate-900">{selected.category}</div>
                        </div>
                      )}

                      <div className="ml-auto flex gap-2">
                        {selected.status !== 'Approved' && (
                          <button onClick={() => approve(selected.id || selected._id)} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
                        )}
                        {selected.status !== 'Rejected' && (
                          <button onClick={() => reject(selected.id || selected._id)} className="px-3 py-2 bg-rose-600 text-white rounded">Reject</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="border-t pt-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 border-b pb-2">Documents</h3>
                    
                    {/* ID Proof Document */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold mb-3 text-slate-800">ID Proof Document</h4>
                      {selected.idProofDocument ? (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-slate-600" />
                              <div>
                                <div className="font-medium text-slate-900">{selected.idProofFileName || 'ID Proof Document'}</div>
                                <div className="text-sm text-slate-500">{selected.idProofFileType || 'Document'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => viewDocument(selected.idProofDocument, selected.idProofFileName || 'ID Proof')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                              >
                                <Eye size={16} />
                                View
                              </button>
                              {/* <a 
                                href={selected.idProofDocument} 
                                download={selected.idProofFileName || 'id-proof'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                              >
                                Download
                              </a> */}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 py-4 bg-slate-50 rounded-lg text-center border border-slate-200">No ID proof document uploaded</div>
                      )}
                    </div>

                    {/* Additional Documents */}
                    <div>
                      <h4 className="text-md font-semibold mb-3 text-slate-800">Additional Documents ({selected.docs?.length || 0})</h4>
                      <div className="space-y-2">
                        {selected.docs && selected.docs.length ? selected.docs.map((d, idx) => (
                          <div key={d.id || idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-4 border border-slate-200">
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
                              onClick={() => {
                                if (d.url) {
                                  let url = d.url;
                                  if (url.startsWith('/')) {
                                    const base = API.replace(/\/api\/?$/, '');
                                    url = `${base}${url}`;
                                  }
                                  viewDocument(url, d.name || 'Document');
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-medium"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </div>
                        )) : <div className="text-sm text-slate-500 py-4 bg-slate-50 rounded-lg text-center border border-slate-200">No additional documents uploaded</div>}
                      </div>
                    </div>

                    {/* Raw JSON for debugging */}
                    {/* <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3 text-slate-800">Full Record (raw)</h4>
                      <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto border border-slate-200">{JSON.stringify(selected, null, 2)}</pre>
                    </div> */}
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
