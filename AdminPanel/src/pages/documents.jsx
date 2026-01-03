import React, { useMemo, useState, useEffect, useRef } from "react";
import { FileText, Download, Trash2, Eye, Plus } from "lucide-react";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "https://ongc-q48j.vercel.app/api";

const DocumentRow = ({ d, onView, onDelete }) => (
  <tr className="bg-white">
    <td className="px-6 py-4 text-sm text-slate-800">{d.title}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.category}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.ref || "N/A"}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{new Date(d.date).toLocaleDateString()}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.fileSize || "N/A"}</td>
    <td className="px-6 py-4 text-right flex justify-end gap-4">
      <button onClick={() => onView(d)} title="View"><Eye size={16} /></button>
      <button onClick={() => onDelete(d.id)} className="text-rose-600" title="Delete"><Trash2 size={16} /></button>
    </td>
  </tr>
);

const Documents = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "CWC Orders",
    ref: "",
    fileUrl: "",
    fileSize: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load cached rows from sessionStorage first for immediate UI
    try {
      const cached = sessionStorage.getItem('admin-documents');
      if (cached) setRows(JSON.parse(cached));
    } catch (e) {
      console.warn('Failed to read cached documents', e);
    }

    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("admin-token");
      const res = await fetch(`${API}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          const docs = data.documents || [];
          setRows(docs);
          try { sessionStorage.setItem('admin-documents', JSON.stringify(docs)); } catch (e) { /* ignore */ }
        } else {
          console.error("Response is not JSON");
        }
      } else {
        console.error("Failed to load documents:", res.status);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const years = useMemo(() => {
    const y = new Set(rows.map(r => new Date(r.date).getFullYear()));
    return Array.from(y).sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (activeTab !== "all") {
        if (activeTab === "orders" && r.category !== "CWC Orders") return false;
        if (activeTab === "letters" && r.category !== "CWC Letters") return false;
        if (activeTab === "meeting" && r.category !== "CWC Meeting") return false;
      }
      if (year && new Date(r.date).getFullYear() !== Number(year)) return false;
      return (r.title + r.category + r.ref).toLowerCase().includes(query.toLowerCase());
    });
  }, [rows, query, activeTab, year]);

  const onView = d => {
    if (!d.fileUrl) {
      alert("No file URL available");
      return;
    }

    // Open in new window for better viewing of base64 or regular URLs
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${d.title || "Document"}</title>
            <style>
              body { margin: 0; padding: 0; background: #f3f4f6; }
              iframe { width: 100vw; height: 100vh; border: none; }
              img { max-width: 100%; display: block; margin: 20px auto; }
            </style>
          </head>
          <body>
            ${d.fileUrl.startsWith("data:image") 
              ? `<img src="${d.fileUrl}" alt="${d.title || "Document"}" />` 
              : `<iframe src="${d.fileUrl}"></iframe>`}
          </body>
        </html>
      `);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    
    try {
      const token = sessionStorage.getItem("admin-token");
      const res = await fetch(`${API}/documents/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (res.ok) {
        const updated = rows.filter(r => r.id !== id);
        setRows(updated);
        try { sessionStorage.setItem('admin-documents', JSON.stringify(updated)); } catch (e) { /* ignore */ }
        alert("Document deleted successfully");
      } else {
        alert("Failed to delete document");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting document");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadForm(prev => ({
        ...prev,
        fileUrl: base64,
        fileSize: `PDF • ${sizeInMB} MB`,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.fileUrl) {
      alert("Please provide a title and select a file");
      return;
    }

    setUploading(true);
    try {
      const token = sessionStorage.getItem("admin-token");
      const res = await fetch(`${API}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(uploadForm),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Document uploaded successfully!");
        setIsUploadOpen(false);
        setUploadForm({
          title: "",
          category: "CWC Orders",
          ref: "",
          fileUrl: "",
          fileSize: "",
          date: new Date().toISOString().split("T")[0],
        });
        // If backend returned the created document, optimistically insert it
        if (data && data.document) {
          setRows(prev => {
            const updated = [data.document, ...(prev || [])];
            try { sessionStorage.setItem('admin-documents', JSON.stringify(updated)); } catch (e) { /* ignore */ }
            return updated;
          });
        } else {
          loadDocuments();
        }
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await res.json();
          alert(error.message || "Failed to upload document");
        } else {
          const text = await res.text();
          console.error("Server response:", text);
          alert(`Server error: ${res.status} - Please check if the backend is running`);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`Error uploading document: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Documents" value={rows.length} icon={<FileText />} />
          <StatCard title="CWC Orders" value={rows.filter(r => r.category === "CWC Orders").length} />
          <StatCard title="CWC Letters" value={rows.filter(r => r.category === "CWC Letters").length} />
        </div>

        {/* TABS + BUTTON */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex gap-3 overflow-x-auto whitespace-nowrap">
            {["all", "orders", "letters", "meeting"].map(t => (
              <Tab key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
                {t === "all" ? "All" : t}
              </Tab>
            ))}
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full sm:w-auto sm:ml-auto bg-slate-900 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Upload
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <select value={year} onChange={e => setYear(e.target.value)} className="border rounded px-3 py-2">
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading documents...</div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm">Document</th>
                      <th className="px-6 py-3 text-left text-sm">Category</th>
                      <th className="px-6 py-3 text-left text-sm">Ref</th>
                      <th className="px-6 py-3 text-left text-sm">Date</th>
                      <th className="px-6 py-3 text-left text-sm">Size</th>
                      <th className="px-6 py-3 text-right text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          No documents found
                        </td>
                      </tr>
                    ) : (
                      filtered.map(d => (
                        <DocumentRow key={d.id} d={d} onView={onView} onDelete={onDelete} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="md:hidden p-4 space-y-4">
                {filtered.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No documents found</div>
                ) : (
                  filtered.map(d => (
                    <div key={d.id} className="bg-white rounded-lg shadow p-4 space-y-2">
                      <div className="font-medium">{d.title}</div>
                      <div className="text-xs text-slate-500">{d.category} • {new Date(d.date).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{d.ref || "No ref"}</div>
                      <div className="flex gap-4 pt-2">
                        <Eye size={18} onClick={() => onView(d)} />
                        <Trash2 size={18} className="text-rose-600" onClick={() => onDelete(d.id)} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !uploading && setIsUploadOpen(false)} />
          <div className="relative bg-white rounded-lg w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            
            <div className="space-y-3">
              <input
                placeholder="Document Title *"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
              
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="CWC Orders">CWC Orders</option>
                <option value="CWC Letters">CWC Letters</option>
                <option value="CWC Meeting">CWC Meeting</option>
                <option value="Other">Other</option>
              </select>
              
              <input
                placeholder="Reference Number"
                value={uploadForm.ref}
                onChange={(e) => setUploadForm(prev => ({ ...prev, ref: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
              
              <input
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
              
              <div>
                <label className="block text-sm mb-1">Select File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="w-full"
                />
                {uploadForm.fileUrl && (
                  <p className="text-xs text-green-600 mt-1">File selected ({uploadForm.fileSize})</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsUploadOpen(false)}
                disabled={uploading}
                className="border px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
    <div>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
      {icon || "✓"}
    </div>
  </div>
);

const Tab = ({ active, children, onClick }) => (
  <div
    onClick={onClick}
    className={`px-4 py-1 rounded cursor-pointer ${
      active ? "bg-slate-900 text-white" : "bg-white border"
    }`}
  >
    {children}
  </div>
);

export default Documents;
