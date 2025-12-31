import React, { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import pdfIcon from "../assets/Vector.png";

const data = {
  "CWC Orders": [
    { title: "CWC Order regarding Annual General Meeting", date: "2024-10-15", ref: "CWC/2024/AGM/001", size: "PDF • 1.2 MB" },
    { title: "Order on Reservation Policy Implementation", date: "2024-08-20", ref: "CWC/2024/RES/012", size: "PDF • 0.8 MB" },
    { title: "CWC Order on Branch Formation Guidelines", date: "2024-08-20", ref: "CWC/2024/RES/012", size: "PDF • 0.9 MB" },
    { title: "CWC Order on Branch Formation Guidelines", date: "2023-06-11", ref: "CWC/2023/RES/009", size: "PDF • 1.1 MB" },
  ],
  "CWC Letters": [
    { title: "Letter to ONGC Management regarding Grievances", date: "2025-02-10", ref: "CWC/2025/LTR/001", size: "PDF • 0.5 MB" },
    { title: "Letter on Policy Changes", date: "2024-05-18", ref: "CWC/2024/LTR/007", size: "PDF • 0.6 MB" },
  ],
  "CWC Meeting": [
    { title: "Minutes of CWC Meeting - July 2024", date: "2024-07-05", ref: "CWC/2024/MTG/004", size: "PDF • 1.4 MB" },
    { title: "CWC Meeting Agenda - Jan 2024", date: "2024-01-20", ref: "CWC/2024/MTG/001", size: "PDF • 0.7 MB" },
  ],
};

const years = [2025, 2024, 2023, 2022];

const Documents = () => {
  const [activeTab, setActiveTab] = useState("CWC Orders");
  const [year, setYear] = useState(2025);

  const list = useMemo(() => {
    const items = data[activeTab] || [];
    return items.filter(
      (it) => new Date(it.date).getFullYear() === Number(year)
    );
  }, [activeTab, year]);

  return (
    <section id="documents" className="w-full bg-white py-10 sm:py-14 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Year Filter */}
          <div className="flex items-center gap-3">
            <label className="font-medium text-slate-800 whitespace-nowrap">
              Filter by Year :
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
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
            {Object.keys(data).map((tab) => (
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
            {list.length === 0 ? (
              <p className="text-center text-slate-500 py-10">
                No documents found for {year} in "{activeTab}".
              </p>
            ) : (
              <ul className="space-y-6">
                {list.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-md shrink-0">
                        <img src={pdfIcon} alt="PDF" className="w-6 h-6" />
                      </div>

                      <div>
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
                          <span className="break-all">Ref: {item.ref}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex gap-3 sm:shrink-0">
                      <a
                        href="#"
                        className="text-[#0C2E50] underline text-sm"
                      >
                        View
                      </a>
                      <a
                        href="#"
                        download
                        className="px-4 py-2 bg-[#0C2E50] text-white rounded-md text-sm hover:bg-[#09345c] transition"
                      >
                        Download
                      </a>
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
    </section>
  );
};

export default Documents;
