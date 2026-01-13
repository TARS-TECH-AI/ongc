import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import cecMembers from "../data/cecMembers";
import cwcMembers from "../data/cwcMember";

// Custom scrollbar hiding styles
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const membersData = [
  
];

const TableCard = () => (
  <div className="w-50 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

    {/* Table Header (Hidden on Mobile) */}
    <div className="hidden sm:block bg-slate-900 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-4 sm:[grid-template-columns:3fr_2fr_1.2fr_80px] px-4 py-4 font-semibold text-sm gap-x-2">
        <span>Name</span>
        <span>Post In Association</span>
        <span>Unit</span>
        <span className="text-left">CPF No</span>
      </div>
    </div>

    {/* Table Body */}
    <div className="divide-y divide-slate-200">
      {membersData.map((member, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-4 sm:[grid-template-columns:3fr_2fr_1.2fr_80px] gap-2 sm:gap-1 px-4 py-4 text-sm text-slate-800"
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

          <div className="text-left">
            <span className="sm:hidden font-semibold text-slate-500">CPF No</span>
            <p>{member.cpf}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Generic Lazy Member List (used for CEC and CWC)
const LazyMemberList = ({ items = [], initialVisible = 5, batch = 5 }) => {
  const [visible, setVisible] = useState(initialVisible);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
        setVisible((v) => Math.min(v + batch, items.length));
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [batch, items.length]);

  const get = (member, key) => member[key] ?? member[key.toLowerCase()] ?? member[key.toUpperCase()] ?? member[key.charAt(0).toUpperCase() + key.slice(1)] ?? "";

  return (
    <div className="w-Full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <style>{scrollbarHideStyle}</style>
      <div className="hidden sm:block bg-slate-900 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-4 sm:[grid-template-columns:2fr_2.5fr_1.2fr_50px] px-4 py-4 font-semibold text-sm gap-x-2">
          <span>Name</span>
          <span>Post In the Association</span>
          <span>Unit</span>
          <span className="text-left">CPF No</span>
        </div>
      </div>

      <div ref={containerRef} className="divide-y divide-slate-200 max-h-[320px] overflow-auto scrollbar-hide">
        {items.slice(0, visible).map((member, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-4 sm:[grid-template-columns:2fr_2.5fr_1.2fr_80px] gap-2 sm:gap-1 px-4 py-4 text-sm text-slate-800"
          >
            <div>
              <span className="sm:hidden font-semibold text-slate-500">Name</span>
              <p className="font-medium">{get(member, 'name')}</p>
            </div>

            <div>
              <span className="sm:hidden font-semibold text-slate-500">postInAssociation</span>
              <p>{get(member, 'postInAssociation')}</p>
            </div>

            <div>
              <span className="sm:hidden font-semibold text-slate-500">Unit</span>
              <p>{get(member, 'unit')}</p>
            </div>

            <div className="text-left">
              <span className="sm:hidden font-semibold text-slate-500">CPF No</span>
              <p className="">{get(member, 'cpfNo')}</p>
            </div>
         </div>
        ))}

        {visible < items.length && (
          <div className="p-4 text-center text-sm text-slate-500">Scroll to load more…</div>
        )}
      </div>
    </div>
  );
};

const MembersSection = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && (sessionStorage.getItem('token') || sessionStorage.getItem('user'));

  return (
    <section id="members" className="w-full px-4 py-12 sm:py-16 lg:py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Members columns: each heading immediately above its box (mobile: stacked) */}
        <div className="relative mt-2">
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 cursor-pointer">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">CWC Members</h2>
                  <div className="w-16 h-1 bg-orange-500 mb-6 cursor-pointer" />
                  <LazyMemberList items={cwcMembers} />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">CEC Members</h2>
                  <div className="w-16 h-1 bg-orange-500 mb-6" />
                  <LazyMemberList items={cecMembers} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default MembersSection;
