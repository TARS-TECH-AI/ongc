import React from "react";
import { Bell, CalendarDays, ChevronDown } from "lucide-react";

const updates = [
  {
    title: "Notice for 42nd Annual General Meeting",
    desc: "The 42nd AGM will be held at ONGC Bhawan, New Delhi on 28th October 2024.",
    date: "15 Nov 2024",
    highlight: true,
  },
  {
    title: "Notice for 42nd Annual General Meeting",
    desc: "The 42nd AGM will be held at ONGC Bhawan, New Delhi on 28th October 2024.",
    date: "15 Nov 2024",
    highlight: false,
  },
  {
    title: "Notice for 42nd Annual General Meeting",
    desc: "The 42nd AGM will be held at ONGC Bhawan, New Delhi on 28th October 2024.",
    date: "15 Nov 2024",
    highlight: false,
  },
];

const UpdateCard = ({ item }) => (
  <div className="flex gap-4 py-5 sm:py-6 border-b last:border-b-0">
    {/* Icon */}
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-full ${
        item.highlight ? "bg-orange-400" : "bg-gray-200"
      }`}
    >
      <Bell
        className={item.highlight ? "text-white" : "text-slate-700"}
        size={20}
      />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm mb-1">
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
            item.highlight
              ? "bg-orange-400 text-white"
              : "bg-gray-200 text-slate-700"
          }`}
        >
          New
        </span>

        <span className="flex items-center gap-1 text-slate-500 text-xs sm:text-sm">
          <CalendarDays size={14} />
          {item.date}
        </span>
      </div>

      <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
        {item.title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
        {item.desc}
      </p>
    </div>

    {/* Arrow */}
    <div className="shrink-0 flex items-start">
      <ChevronDown className="text-slate-500 mt-2" size={18} />
    </div>
  </div>
);

const ImportantUpdates = () => {
  return (
    <section id="updates" className="w-full bg-white py-10 sm:py-14 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Important Updates
          </h2>
          <div className="w-24 sm:w-32 h-1 bg-orange-400 mx-auto mt-3" />
        </div>

        {/* Content */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

          {/* Center Divider (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-slate-300" />

          {/* Left Column */}
          <div className="md:pr-8 lg:pr-12">
            {updates.map((item, i) => (
              <UpdateCard key={`left-${i}`} item={item} />
            ))}
          </div>

          {/* Right Column */}
          <div className="md:pl-8 lg:pl-12">
            {updates.map((item, i) => (
              <UpdateCard key={`right-${i}`} item={item} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImportantUpdates;
