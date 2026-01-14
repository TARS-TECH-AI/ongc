import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import cecMembers from "../data/cecMembers";
import cwcMembers from "../data/cwcMember";

const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';


// Custom scrollbar hiding styles
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-hide::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  .scrollbar-hide::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  @media (max-width: 640px) {
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }
`;

const membersData = [
  
];

const TableCard = () => (
  <div className="w-50 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden cursor-pointer">

    {/* Table Header (Hidden on Mobile) */}
    <div className="hidden sm:block bg-slate-900 text-white cursor-pointer">
      <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr_1.2fr_80px] px-4 py-4 font-semibold text-sm gap-x-2 cursor-pointer">
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
          className="grid grid-cols-1 sm:grid-cols-[3fr_2fr_1.2fr_80px] gap-2 sm:gap-1 px-4 py-4 text-sm text-slate-800"
        >
          {/* Name */}
          <div>
            <span className="sm:hidden font-semibold text-slate-500">Name</span>
            <p className="font-medium">{member.name}</p>
          </div>

          {/* Designation */}
          <div>
            <span className="sm:hidden font-semibold text-slate-500">
              Post In Association
            </span>
            <p>{member.postInAssociation || member.designation}</p>
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
const LazyMemberList = ({ items = [], initialVisible = 20, batch = 10 }) => {
  const [visible, setVisible] = useState(initialVisible);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

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

  // IntersectionObserver to load more items when sentinel becomes visible (seamless load)
  useEffect(() => {
    const root = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible((v) => Math.min(v + batch, items.length));
        }
      });
    }, { root, threshold: 0.1 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [batch, items.length]);

  const get = (member, key) => member[key] ?? member[key.toLowerCase()] ?? member[key.toUpperCase()] ?? member[key.charAt(0).toUpperCase() + key.slice(1)] ?? "";

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col cursor-pointer">
      <style>{scrollbarHideStyle}</style>
      <div className="hidden sm:block bg-slate-900 text-white shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_2.5fr_1.2fr_50px] px-4 py-4 font-semibold text-sm gap-x-2">
          <span>Name</span>
          <span>Post In the Association</span>
          <span>Unit</span>
          <span>CPF No</span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 divide-y divide-slate-200 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {items.slice(0, visible).map((member, index) => (
          <div
            key={index}
            className="bg-white sm:bg-transparent rounded-lg sm:rounded-none p-4 sm:p-3 grid grid-cols-1 sm:grid-cols-[2fr_2.5fr_1.2fr_80px] gap-3 sm:gap-2 text-sm text-slate-800"
          >
            <div>
              <span className="sm:hidden font-semibold text-slate-500">Name</span>
              <p className="font-medium">{get(member, 'name')}</p>
            </div>

            <div className={`${((member.type || member.category || '').toString().toUpperCase() === 'CEC') ? 'text-center sm:text-left' : ''}`}>
              <span className="sm:hidden font-semibold text-slate-500">postInAssociation</span>
              <p className="truncate">{get(member, 'postInAssociation')}</p>
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

        {/* invisible sentinel used by IntersectionObserver to trigger loading more items */}
        <div ref={sentinelRef} className="h-px" />
      </div>
    </div>
  );
};

const MembersSection = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && (sessionStorage.getItem('token') || sessionStorage.getItem('user'));

  const [cwcListState, setCwcListState] = useState(cwcMembers);
  const [cecListState, setCecListState] = useState(cecMembers);
  const [loadingCwc, setLoadingCwc] = useState(false);
  const [loadingCec, setLoadingCec] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchMembers = async (type, setter, setLoading) => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/members?type=${type}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (mounted && data && Array.isArray(data.items)) {
          // Merge local static list with backend items so original members remain visible
          const backendItems = data.items.map(i => ({ ...i, postInAssociation: i.postInAssociation || i.designation || '' }));
          const merged = (type === 'cwc' ? cwcMembers.map(m => ({ ...m })) : cecMembers.map(m => ({ ...m }))).concat(backendItems);
          setter(merged);
        }
      } catch (e) {
        console.warn('Members fetch failed for', type, e.message || e);
      } finally { if (mounted) setLoading(false); }
    };

    // initial fetch
    fetchMembers('cwc', setCwcListState, setLoadingCwc);
    fetchMembers('cec', setCecListState, setLoadingCec);

    // poll every 30s
    const t = setInterval(() => {
      fetchMembers('cwc', setCwcListState, setLoadingCwc);
      fetchMembers('cec', setCecListState, setLoadingCec);
    }, 30000);

    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <section id="members" className="w-full px-4 py-12 sm:py-16 lg:py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Members columns: each heading immediately above its box (mobile: stacked) */}
        <div className="relative mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                <div className="flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">CWC Members</h2>
                  <div className="w-16 h-1 bg-orange-500 mb-6 cursor-pointer" />
                  <div className="h-[50vh] sm:h-[55vh] lg:h-[65vh] overflow-hidden">
                    {loadingCwc ? <div className="text-sm text-slate-500 mb-2">Loading…</div> : <LazyMemberList items={cwcListState} />}
                  </div>
                </div>

                <div className="flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">CEC Members</h2>
                  <div className="w-16 h-1 bg-orange-500 mb-6" />
                  <div className="h-[50vh] sm:h-[55vh] lg:h-[65vh] overflow-hidden">
                    {loadingCec ? <div className="text-sm text-slate-500 mb-2">Loading…</div> : <LazyMemberList items={cecListState} />}
                  </div>
                </div>
              </div>
        </div>
      </div>
    </section>
  );
};

export default MembersSection;
