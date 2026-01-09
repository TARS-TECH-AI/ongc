import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import cecMembers from "../data/cecMembers";
import cwcMembers from "../data/cwcMember";

const membersData = [
  
];

const TableCard = () => (
  <div className="w-50 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

    {/* Table Header (Hidden on Mobile) */}
    <div className="hidden sm:block bg-slate-900 text-white">
      <div className="grid grid-cols-4 px-6 py-4 font-semibold text-sm" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
        <span>Name</span>
        <span>Designation</span>
        <span>Unit</span>
        <span>CPF No</span>
      </div>
    </div>

    {/* Table Body */}
    <div className="divide-y divide-slate-200">
      {membersData.map((member, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 px-4 sm:px-6 py-4 text-sm text-slate-800"
          style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr' }}
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

          <div>
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
    <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="hidden sm:block bg-slate-900 text-white">
        <div className="grid grid-cols-4 px-6 py-4 font-semibold text-sm">
          <span>Name</span>
          <span>Post in the Association</span>
          <span>Unit</span>
          <span>CPF No</span>
        </div>
      </div>

      <div ref={containerRef} className="divide-y divide-slate-200 max-h-[320px] overflow-auto">
        {items.slice(0, visible).map((member, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-0 px-4 sm:px-6 py-4 text-sm text-slate-800"
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

            <div>
              <span className="sm:hidden font-semibold text-slate-500">CPF No</span>
              <p>{get(member, 'cpfNo')}</p>
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

        {/* Headings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">CWC Members</h2>
            <div className="w-16 h-1 bg-orange-500 mb-6" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">CEC Members</h2>
            <div className="w-16 h-1 bg-orange-500 mb-6" />
          </div>
        </div>

        {/* Lists (blurred when not authenticated) */}
        <div className="relative mt-2">
          <div className={isAuthenticated ? '' : 'blur-md pointer-events-none select-none'}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12">
              <div>
                <LazyMemberList items={cwcMembers} />
              </div>
              <div>
                <LazyMemberList items={cecMembers} />
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-6 rounded-md text-center max-w-sm z-40">
                <p className="text-white mb-4 font-medium">
                  Please login or register to view member details
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      console.log('MembersSection: Login clicked');
                      if (onOpenAuth) return onOpenAuth('login');
                      navigate('/login');
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      console.log('MembersSection: Register clicked');
                      if (onOpenAuth) return onOpenAuth('register');
                      navigate('/register');
                    }}
                    className="bg-transparent border border-white/30 text-white px-4 py-2 rounded hover:bg-white/5"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MembersSection;
