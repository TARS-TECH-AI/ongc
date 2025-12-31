import React from "react";

const membersData = [
  { name: "Rajesh Kumar", designation: "President", unit: "ONGC Delhi" },
  { name: "Sunita Devi", designation: "Vice President", unit: "ONGC Mumbai" },
  { name: "Priya Sharma", designation: "General Secretary", unit: "ONGC Dehradun" },
  { name: "Sunita Devi", designation: "Joint Secretary", unit: "ONGC Ahmedabad" },
  { name: "Rajesh Kumar", designation: "Member", unit: "ONGC Kolkata" },
];

const TableCard = () => (
  <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

    {/* Table Header (Hidden on Mobile) */}
    <div className="hidden sm:block bg-slate-900 text-white">
      <div className="grid grid-cols-3 px-6 py-4 font-semibold text-sm">
        <span>Name</span>
        <span>Designation</span>
        <span>Unit</span>
      </div>
    </div>

    {/* Table Body */}
    <div className="divide-y divide-slate-200">
      {membersData.map((member, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 px-4 sm:px-6 py-4 text-sm text-slate-800"
        >
          {/* Name */}
          <div>
            <span className="sm:hidden font-semibold text-slate-500">Name</span>
            <p className="font-medium">{member.name}</p>
          </div>

          {/* Designation */}
          <div>
            <span className="sm:hidden font-semibold text-slate-500">
              Designation
            </span>
            <p>{member.designation}</p>
          </div>

          {/* Unit */}
          <div>
            <span className="sm:hidden font-semibold text-slate-500">Unit</span>
            <p>{member.unit}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MembersSection = () => {
  return (
    <section id="members" className="w-full px-4 py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Headings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">

          {/* CWC */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              CWC Members
            </h2>
            <div className="w-16 h-1 bg-orange-500 mb-6"></div>
            <TableCard />
          </div>

          {/* CEC */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              CEC Members
            </h2>
            <div className="w-16 h-1 bg-orange-500 mb-6"></div>
            <TableCard />
          </div>

        </div>
      </div>
    </section>
  );
};

export default MembersSection;
