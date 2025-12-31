import React, { useMemo, useState } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import Member1 from "../assets/Member1.png";
import Member2 from "../assets/Member2.png";
import Member3 from "../assets/Member3.png";

const sampleMembers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@ongc.co.in",
    phone: "+91 98XXX 12345",
    category: "SC",
    joined: "5/19/12",
    status: "Active",
  },
  {
    id: 2,
    name: "Sunita Devi",
    email: "sunita.devi@ongc.co.in",
    phone: "+91 98XXX 12345",
    category: "SC",
    joined: "5/27/15",
    status: "Active",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priya.sharma@ongc.co.in",
    phone: "+91 98XXX 12345",
    category: "ST",
    joined: "10/28/12",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Sunita Devi",
    email: "sunita.devi2@ongc.co.in",
    phone: "+91 98XXX 12345",
    category: "SC",
    joined: "8/2/19",
    status: "Active",
  },
  {
    id: 5,
    name: "Rajesh Kumar",
    email: "rajesh.kumar2@ongc.co.in",
    phone: "+91 98XXX 12345",
    category: "SC",
    joined: "9/23/16",
    status: "Active",
  },
  {
    id: 6,
    name: "Sunita Devi",
    email: "sunita@example.com",
    phone: "+91 98XXX 12345",
    category: "ST",
    joined: "6/21/19",
    status: "Inactive",
  },
];

const Badge = ({ status }) => {
  if (status === "Active")
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
        <CheckCircle size={14} className="mr-2" />
        {status}
      </span>
    );
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
      <XCircle size={14} className="mr-2" />
      {status}
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
  const [members] = useState(sampleMembers);

  const filtered = useMemo(() => {
    const val = q.trim().toLowerCase();
    if (!val) return members;
    return members.filter((m) =>
      (m.name + m.email + m.phone + m.category).toLowerCase().includes(val)
    );
  }, [q, members]);

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
                  Contact
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
                          {m.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>{m.email}</div>
                    <div className="text-xs text-slate-400 mt-1">{m.phone}</div>
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
                    <button className="text-sky-700 hover:underline">
                      View Details
                    </button>
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
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-slate-800">
                  {m.name}
                </div>
                <div className="text-xs text-slate-500">
                  {m.category} • {m.joined}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {m.email} • {m.phone}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge status={m.status} />
                <button className="text-sky-700 text-sm hover:underline">
                  View Details
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
