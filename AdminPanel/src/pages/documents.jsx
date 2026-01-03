import React, { useMemo, useState, useEffect, useRef } from "react";
import { FileText, Download, Trash2, Eye, Plus } from "lucide-react";

const sample = [
  { id: 1, title: "PM Meeting Letter - Jan 2024", assigned: "All Members", type: "Letter", date: "5/19/12", status: "Issued" },
  { id: 2, title: "Welfare Scheme Approval", assigned: "Rajesh Kumar", type: "Approval", date: "5/27/15", status: "Issued" },
  { id: 3, title: "Minister Meeting Notice", assigned: "Group A", type: "Notice", date: "10/28/12", status: "Pending" },
  { id: 4, title: "Annual Report 2023", assigned: "All Members", type: "Report", date: "8/2/19", status: "Issued" },
  { id: 5, title: "Membership Certificate", assigned: "Sunita Devi", type: "Certificate", date: "9/23/16", status: "Pending" },
];

const StatusPill = ({ s }) => (
  <span
    className={`text-sm font-medium ${
      s === "Issued" ? "text-emerald-700" : s === "Pending" ? "text-rose-600" : "text-slate-700"
    }`}
  >
    {s}
  </span>
);

const DocumentRow = ({ d, onView, onDownload, onDelete }) => (
  <tr className="bg-white">
    <td className="px-6 py-4 text-sm text-slate-800">{d.title}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.assigned}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.type}</td>
    <td className="px-6 py-4 text-sm text-slate-600">{d.date}</td>
    <td className="px-6 py-4"><StatusPill s={d.status} /></td>
    <td className="px-6 py-4 text-right flex justify-end gap-4">
      <button onClick={() => onView(d)}><Eye size={16} /></button>
      <button onClick={() => onDownload(d)}><Download size={16} /></button>
      <button onClick={() => onDelete(d.id)} className="text-rose-600"><Trash2 size={16} /></button>
    </td>
  </tr>
);

const Documents = () => {
  const [rows, setRows] = useState(sample);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());

  const years = useMemo(() => {
    const y = new Set(rows.map(r => new Date(r.date).getFullYear()));
    return Array.from(y).sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (activeTab !== "all") {
        if (activeTab === "orders" && r.type.toLowerCase() !== "approval") return false;
        if (activeTab === "letters" && r.type.toLowerCase() !== "letter") return false;
        if (activeTab === "meeting" && r.type.toLowerCase() !== "notice") return false;
      }
      if (year && new Date(r.date).getFullYear() !== Number(year)) return false;
      return (r.title + r.assigned + r.type).toLowerCase().includes(query.toLowerCase());
    });
  }, [rows, query, activeTab, year]);

  const onView = d => alert(`View: ${d.title}`);
  const onDownload = d => alert(`Download: ${d.title}`);
  const onDelete = id => {
    if (confirm("Delete this document?")) {
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef(null);

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Documents" value={rows.length} icon={<FileText />} />
          <StatCard title="Issued" value={rows.filter(r => r.status === "Issued").length} />
          <StatCard title="Pending" value={rows.filter(r => r.status === "Pending").length} />
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
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Document</th>
                  <th className="px-6 py-3 text-left text-sm">Assigned</th>
                  <th className="px-6 py-3 text-left text-sm">Type</th>
                  <th className="px-6 py-3 text-left text-sm">Date</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-right text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(d => (
                  <DocumentRow key={d.id} d={d} onView={onView} onDownload={onDownload} onDelete={onDelete} />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden p-4 space-y-4">
            {filtered.map(d => (
              <div key={d.id} className="bg-white rounded-lg shadow p-4 space-y-2">
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-slate-500">{d.assigned} • {d.date}</div>
                <StatusPill s={d.status} />
                <div className="flex gap-4 pt-2">
                  <Eye size={18} onClick={() => onView(d)} />
                  <Download size={18} onClick={() => onDownload(d)} />
                  <Trash2 size={18} className="text-rose-600" onClick={() => onDelete(d.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsUploadOpen(false)} />
          <div className="relative bg-white rounded-lg w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            <input placeholder="Document Name" className="w-full border rounded px-3 py-2 mb-3" />
            <input type="file" ref={fileInputRef} className="w-full" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsUploadOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button className="bg-slate-900 text-white px-4 py-2 rounded">Upload</button>
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
