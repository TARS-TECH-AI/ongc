import React, { useRef, useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import frameImg from "../assets/Frame.png";

/* ===== UNITS DATA ===== */
const units = [
  { name: "ONGC Delhi", region: "Northern Region", secretary: "Shri Amit Kumar", members: 450 },
  { name: "ONGC Mumbai", region: "Western Region", secretary: "Shri Prakash Jadhav", members: 680 },
  { name: "ONGC Vadodara", region: "Western Region", secretary: "Shri Ramesh Patel", members: 520 },
  { name: "ONGC Kolkata", region: "Eastern Region", secretary: "Shri Anil Roy", members: 390 },
  { name: "ONGC Chennai", region: "Southern Region", secretary: "Shri S. Krishnan", members: 610 },
  { name: "ONGC Dehradun", region: "Northern Region", secretary: "Shri Mohit Verma", members: 430 },
  { name: "ONGC Kolkata", region: "Eastern Region", secretary: "Shri Anil Roy", members: 390 },
  { name: "ONGC Chennai", region: "Southern Region", secretary: "Shri S. Krishnan", members: 610 },
  { name: "ONGC Kolkata", region: "Eastern Region", secretary: "Shri Anil Roy", members: 390 },
  { name: "ONGC Chennai", region: "Southern Region", secretary: "Shri S. Krishnan", members: 610 },
  { name: "ONGC Dehradun", region: "Northern Region", secretary: "Shri Mohit Verma", members: 430 },
 
];

/* ===== FRAME IMAGE ===== */
const FrameImage = ({ children }) => (
  <div className="relative w-full h-full">
    <img
      src={frameImg}
      alt="Frame"
      className="w-full h-full object-contain"
    />
    <div className="absolute inset-0 flex items-center justify-center px-3">
      <div className="w-[85%] h-[75%] flex items-center justify-center">
        {children}
      </div>
    </div>
  </div>
);

const AISCSSTEWAUnits = () => {
  const scrollRef = useRef(null);
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanUp(el.scrollTop > 0);
      setCanDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scrollBy = (dir) => {
    scrollRef.current.scrollBy({
      top: dir * scrollRef.current.clientHeight * 0.6,
      behavior: "smooth",
    });
  };

  return (
    <section id="units" className="w-full bg-white py-12 sm:py-16 lg:py-10">

      {/* ===== HEADING ===== */}
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0C2E50]">
          AISCSSTEWA Units
        </h2>
        <div className="w-28 sm:w-40 h-1 bg-orange-500 mx-auto mt-4" />
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: "22", label: "Total Units" },
            { value: "228,570", label: "Total Members" },
            { value: "6", label: "Regions" },
            { value: "100%", label: "Coverage" },
          ].map((item, i) => (
            <div key={i} className="h-28 sm:h-36 md:h-40 lg:h-44">
              <FrameImage>
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0C2E50]">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-[#0C2E50]">
                    {item.label}
                  </p>
                </div>
              </FrameImage>
            </div>
          ))}
        </div>
      </div>

      {/* ===== UNITS LIST ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="relative max-w-6xl mx-auto">

          {/* SCROLL AREA */}
          <div
            ref={scrollRef}
            className="
              max-h-[260px]
              sm:max-h-[360px]
              md:max-h-[420px]
              overflow-y-auto
              hide-scrollbar
              rounded-2xl
              border border-orange-300
              bg-white
              px-4 sm:px-8 lg:px-12
              py-4 sm:py-6
            "
          >
            {units.map((unit, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row justify-between gap-4 py-5 "
              >
                {/* LEFT */}
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {unit.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {unit.region}
                  </p>
                </div>

                {/* CENTER */}
                <div>
                  <p className="font-semibold text-slate-900">
                    Unit Secretary
                  </p>
                  <p className="text-slate-700 text-sm">
                    {unit.secretary}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="lg:text-right">
                  <p className="font-semibold text-slate-900 text-sm">
                    Total Members:{" "}
                    {new Intl.NumberFormat().format(unit.members)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP SCROLL BUTTONS */}
          <div className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-4">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canUp}
              className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-40"
            >
              <ArrowUp />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canDown}
              className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-40"
            >
              <ArrowDown />
            </button>
          </div>

          {/* MOBILE SCROLL BUTTONS */}
          <div className="md:hidden flex justify-center gap-6 mt-6">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canUp}
              className="w-10 h-10 rounded-full bg-white shadow disabled:opacity-40"
            >
              <ArrowUp className="mx-auto" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canDown}
              className="w-10 h-10 rounded-full bg-white shadow disabled:opacity-40"
            >
              <ArrowDown className="mx-auto" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AISCSSTEWAUnits;
