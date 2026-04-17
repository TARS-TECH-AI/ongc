import React, { useRef, useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

const leftLinks = [
  { label: "ONGC India (Official Website)", url: "https://www.ongcindia.com" },
  { label: "ONGC Webmail", url: "https://mail.ongc.co.in" },
  { label: "WebICE Portal", url: "https://webice.ongc.co.in" },
];

const rightLinks = [
  { label: "Ministry of Petroleum & Natural Gas", url: "https://mopng.gov.in/en" },
  { label: "National Commission for Scheduled Castes", url: "https://ncsc.nic.in" },
  { label: "National Commission for Scheduled Tribes", url: "https://ncst.nic.in" },
 ];

const LinkColumn = ({ title, items }) => (
  <div className="bg-white rounded-xl border border-slate-300 w-full">
    <div className="sm:px-6 py-3 sm:py-4 text-center font-bold text-sm sm:text-base text-white bg-[#0C2E50] rounded-t-xl">
      {title}
    </div>

    <ul className="divide-y divide-slate-200">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 gap-4"
        >
          <div className="text-black text-sm sm:text-base">
            {item.label}
          </div>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${item.label} (new tab)`}
            className="text-slate-500 hover:text-slate-400 p-2 rounded-md"
            title={`Open ${item.label}`}
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const ImportantLinks = () => {
  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
  }, [index]);

  return (
    <section className="py-12 sm:py-14 lg:py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Important Links
          </h2>
          <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
        </div>

        <div className="relative">

          {/* Mobile - Show Both Boxes */}
          <div className="md:hidden space-y-6">
            <LinkColumn title="ONGC Portals" items={leftLinks} />
            <LinkColumn title="Government Portals" items={rightLinks} />
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-2 gap-8">
            <LinkColumn title="ONGC Portals" items={leftLinks} />
            <LinkColumn title="Government Portals" items={rightLinks} />
          </div>
          </div>
      </div>
    </section>
  );
};

export default ImportantLinks;
