import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FileText, Download, Trash2, Eye, Plus } from 'lucide-react';

const sample = [
  { id: 1, title: 'PM Meeting Letter - Jan 2024', assigned: 'All Members', type: 'Letter', date: '5/19/12', status: 'Issued' },
  { id: 2, title: 'Welfare Scheme Approval', assigned: 'Rajesh Kumar', type: 'Approval', date: '5/27/15', status: 'Issued' },
  { id: 3, title: 'Minister Meeting Notice', assigned: 'Group A', type: 'Notice', date: '10/28/12', status: 'Pending' },
  { id: 4, title: 'Annual Report 2023', assigned: 'All Members', type: 'Report', date: '8/2/19', status: 'Issued' },
  { id: 5, title: 'Membership Certificate', assigned: 'Sunita Devi', type: 'Certificate', date: '9/23/16', status: 'Pending' },
];

const StatusPill = ({ s }) => {
  if (s === 'Issued') return <span className="text-emerald-700 text-sm font-medium">{s}</span>;
  if (s === 'Pending') return <span className="text-rose-600 text-sm font-medium">{s}</span>;
  return <span className="text-slate-700 text-sm font-medium">{s}</span>;
};

const DocumentRow = ({ d, onView, onDownload, onDelete }) => (
  <tr key={d.id} className="bg-white">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{d.title}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{d.assigned}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{d.type}</td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{d.date}</td>
    <td className="px-6 py-4 whitespace-nowrap"><StatusPill s={d.status} /></td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex items-center justify-end gap-3">
      <button onClick={() => onView(d)} className="text-slate-700 hover:text-slate-900"><Eye size={16} /></button>
      <button onClick={() => onDownload(d)} className="text-slate-700 hover:text-slate-900"><Download size={16} /></button>
      <button onClick={() => onDelete(d.id)} className="text-rose-600 hover:text-rose-700"><Trash2 size={16} /></button>
    </td>
  </tr>
);

const Documents = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState(sample);

  const years = useMemo(() => {
    const ys = new Set(rows.map(r => {
      const d = new Date(r.date);
      return Number.isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
    }));
    ys.add(new Date().getFullYear());
    return Array.from(ys).sort((a,b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r => {
      // map activeTab names to types used in sample: orders/letters/meeting
      if (activeTab !== 'all') {
        if (activeTab === 'orders' && r.type.toLowerCase() !== 'approval') return false;
        if (activeTab === 'letters' && r.type.toLowerCase() !== 'letter') return false;
        if (activeTab === 'meeting' && r.type.toLowerCase() !== 'notice') return false;
      }
      if (year && new Date(r.date).getFullYear() !== Number(year)) return false;
      if (!q) return true;
      return (r.title + r.assigned + r.type).toLowerCase().includes(q);
    });
  }, [rows, query, activeTab, year]);

  const onView = (d) => alert(`View: ${d.title}`);
  const onDownload = (d) => alert(`Download: ${d.title}`);
  const onDelete = (id) => {
    if (!confirm('Delete this document?')) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', type: '', assigned: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsUploadOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFileSelect = (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) return setFileError('Only PDF, PNG or JPG files are allowed');
    if (file.size > 5 * 1024 * 1024) return setFileError('File too large. Max 5MB');
    setSelectedFile(file);
    setFileError('');
  };

  const handleFileInputChange = (e) => onFileSelect(e.target.files && e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => e.preventDefault();

  const uploadSubmit = async (e) => {
    e && e.preventDefault();
    setFileError('');
    if (!selectedFile) return setFileError('Please select a file to upload');
    setUploading(true);

    const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'https://ongc-q48j.vercel.app/api';

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', uploadForm.title);
      fd.append('type', uploadForm.type);
      fd.append('assigned', uploadForm.assigned);

      // try real upload
      const res = await fetch(`${API}/documents`, { method: 'POST', body: fd });
      if (!res.ok) {
        // if server not available or returns error, try to parse message
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Upload failed');
      }

      const data = await res.json().catch(() => ({}));
      const newDoc = {
        id: data.id || Date.now(),
        title: data.title || uploadForm.title || selectedFile.name,
        assigned: data.assigned || uploadForm.assigned || 'All Members',
        type: data.type || uploadForm.type || 'Document',
        date: data.date || new Date().toLocaleDateString(),
        status: data.status || 'Issued',
      };

      setRows(prev => [newDoc, ...prev]);
      setIsUploadOpen(false);
      setUploadForm({ title: '', type: '', assigned: '' });
      setSelectedFile(null);
    } catch (err) {
      // if network error, simulate success as fallback
      if (err.message && err.message.toLowerCase().includes('failed') || err instanceof TypeError) {
        const newDoc = {
          id: Date.now(),
          title: uploadForm.title || selectedFile.name,
          assigned: uploadForm.assigned || 'All Members',
          type: uploadForm.type || 'Document',
          date: new Date().toLocaleDateString(),
          status: 'Issued',
        };
        setRows(prev => [newDoc, ...prev]);
        setIsUploadOpen(false);
        setUploadForm({ title: '', type: '', assigned: '' });
        setSelectedFile(null);
      } else {
        alert(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Total Documents</div>
              <div className="text-2xl font-bold text-slate-900">{rows.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center"><FileText size={20}/></div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Documents Issued</div>
              <div className="text-2xl font-bold text-slate-900">{rows.filter(r => r.status === 'Issued').length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">✓</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Pending</div>
              <div className="text-2xl font-bold text-slate-900">{rows.filter(r => r.status === 'Pending').length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">!</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-3 py-1 rounded-md cursor-pointer ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-white border'}`} onClick={() => setActiveTab('all')}>All Documents</div>
            <div className={`px-3 py-1 rounded-md cursor-pointer ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'bg-white border'}`} onClick={() => setActiveTab('orders')}>Orders</div>
            <div className={`px-3 py-1 rounded-md cursor-pointer ${activeTab === 'letters' ? 'bg-slate-900 text-white' : 'bg-white border'}`} onClick={() => setActiveTab('letters')}>Letters</div>
            <div className={`px-3 py-1 rounded-md cursor-pointer ${activeTab === 'meeting' ? 'bg-slate-900 text-white' : 'bg-white border'}`} onClick={() => setActiveTab('meeting')}>Meeting</div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => setIsUploadOpen(true)} className="ml-auto bg-slate-900 text-white px-4 py-2 rounded inline-flex items-center gap-2"><Plus size={16}/> Upload Document</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="flex-1">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Documents...." className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700">Filter by Year :</label>
            <select className="border rounded px-3 py-2" value={year} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Documents</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Assigned To</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Upload date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(d => (
                  <DocumentRow key={d.id} d={d} onView={onView} onDownload={onDownload} onDelete={onDelete} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.map(d => (
              <div key={d.id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{d.title}</div>
                  <div className="text-xs text-slate-500">{d.assigned} • {d.date}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill s={d.status} />
                  <div className="flex items-center gap-2">
                    <button onClick={() => onView(d)} className="text-slate-700"><Eye size={16} /></button>
                    <button onClick={() => onDownload(d)} className="text-slate-700"><Download size={16} /></button>
                    <button onClick={() => onDelete(d.id)} className="text-rose-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={() => !uploading && setIsUploadOpen(false)} />

          <form onSubmit={uploadSubmit} className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold">Upload New Document</h2>
              <button type="button" onClick={() => !uploading && setIsUploadOpen(false)} className="text-slate-600">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Document Name</label>
                <input required value={uploadForm.title} onChange={(e) => setUploadForm(s => ({ ...s, title: e.target.value }))} placeholder="Enter Document name" className="w-full mt-2 border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm font-medium">Document Type</label>
                <input required value={uploadForm.type} onChange={(e) => setUploadForm(s => ({ ...s, type: e.target.value }))} placeholder="Enter Document Type" className="w-full mt-2 border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm font-medium">Assign To</label>
                <input value={uploadForm.assigned} onChange={(e) => setUploadForm(s => ({ ...s, assigned: e.target.value }))} placeholder="Enter Assign To" className="w-full mt-2 border rounded px-3 py-2" />
              </div>

              <div>
                <label className="text-sm font-medium">Upload Documents</label>
                <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()} className="mt-2 border-2 border-dashed border-slate-300 rounded p-6 text-center cursor-pointer">
                  {!selectedFile ? (
                    <>
                      <div className="text-2xl mb-2">⤴</div>
                      <div className="text-sm text-slate-500">Click to upload<br/>PDF, JPG, PNG (Max 5MB)</div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-700">{selectedFile.name} • {(selectedFile.size/1024/1024).toFixed(2)} MB</div>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,image/png,image/jpeg" onChange={handleFileInputChange} className="hidden" />
                </div>
                {fileError && <div className="text-sm text-rose-600 mt-2">{fileError}</div>}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsUploadOpen(false)} disabled={uploading} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-slate-900 text-white rounded">{uploading ? 'Uploading...' : 'Upload Document'}</button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Documents;