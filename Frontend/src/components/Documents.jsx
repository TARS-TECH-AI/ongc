import React, { useMemo, useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import pdfIcon from "../assets/Vector.png";
import AuthModal from "./AuthModal";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "https://ongc-q48j.vercel.app/api";

const yearRanges = [
  { label: "2026-2027", start: 2026, end: 2027 },
  { label: "2025-2026", start: 2025, end: 2026 },
  { label: "2024-2025", start: 2024, end: 2025 },
  { label: "2023-2024", start: 2023, end: 2024 },
  { label: "2022-2023", start: 2022, end: 2023 },
];
const categories = ["CWC Orders", "CWC Letters", "CWC Meeting", "Others"];

const Documents = () => {
  const [activeTab, setActiveTab] = useState("CWC Orders");
  const [selectedYearRange, setSelectedYearRange] = useState(yearRanges[1].label);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/documents`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setDocuments(data.documents || []);
        } else {
          console.error('Response is not JSON, using empty array');
          setDocuments([]);
        }
      } else {
        console.error('Failed to load documents:', res.status);
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const list = useMemo(() => {
    const selectedRange = yearRanges.find((range) => range.label === selectedYearRange) || yearRanges[0];
    return documents.filter((doc) => {
      if (doc.category !== activeTab) return false;
      const date = new Date(doc.date);
      if (Number.isNaN(date.getTime())) return false;

      // Filter by academic-style year range, e.g. 2025-2026
      const year = date.getFullYear();
      return year >= selectedRange.start && year <= selectedRange.end;
    });
  }, [documents, activeTab, selectedYearRange]);

  const handleViewDocument = (fileUrl, title) => {
    // Check if user is logged in (using sessionStorage like App.jsx)
    const token = sessionStorage.getItem("token");
    if (!token) {
      // Show login modal if not logged in
      setAuthMode("login");
      setShowAuthModal(true);
      return;
    }

    // User is logged in - open document for viewing
    if (!fileUrl) {
      alert("No document available");
      return;
    }

    // Use Google Docs Viewer to display PDF without download
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    window.open(googleViewerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="documents" className="w-full bg-white py-10 sm:py-14 lg:py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Year Filter */}
          <div className="flex items-center gap-3">
            <label className="font-medium text-slate-800 whitespace-nowrap">
              Filter by Year :
            </label>
            <select
              value={selectedYearRange}
              onChange={(e) => setSelectedYearRange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              {yearRanges.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0C2E50] mr-6">
              Official Documents
            </h2>
            <div className="w-28 sm:w-36 h-1 bg-orange-500 mx-auto mt-3" />
          </div>

          <div className="hidden sm:block" />
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <nav className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 ">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition cursor-pointer
                  ${
                    activeTab === tab
                      ? "bg-slate-100 border-b-2 border-[#0C2E50] text-[#0C2E50]"
                      : "text-slate-600 hover:text-[#0C2E50]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="mt-4 border-t border-slate-200" />

          {/* Documents List */}
          <div className="mt-6">
            {loading ? (
              <p className="text-center text-slate-500 py-10">
                Loading documents...
              </p>
            ) : list.length === 0 ? (
              <p className="text-center text-slate-500 py-10">
                No documents found for {selectedYearRange} in "{activeTab}".
              </p>
            ) : (
              <ul className="space-y-6">
                {list.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleViewDocument(item.fileUrl, item.title)}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg hover:bg-slate-50 transition cursor-pointer group relative"
                  >
                    {/* Left */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-md shrink-0">
                        <img src={pdfIcon} alt="PDF" className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(item.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {item.ref && <span className="break-all">Ref: {item.ref}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Divider (mobile only) */}
                    <div className="border-t border-slate-200 sm:hidden" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          console.log("User logged in:", user);
          setShowAuthModal(false);
        }}
      />
    </section>
  );
};

export default Documents;
