import React from "react";
import frameImg from "../assets/Frame.png";

/* ===== UNITS DATA ===== */
const units = [
  "Agartala",
  "Ahmedabad",
  "Ankleshwar",
  "Baroda",
  "Cambay",
  "CBM-Bokaro",
  "Chennai",
  "Dehradun",
  "Delhi",
  "Goa",
  "Hazira",
  "Jodhpur",
  "Jorhat",
  "Kakinada",
  "Karaikal",
  "Kolkata",
  "Mehsana",
  "Mumbai",
  "Rajamundry",
  "Silchar",
  "Nazira/Sivasagar",
  "Uran",
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


  return (
    <section id="units" className="w-full bg-white py-12 sm:py-16 lg:py-10">

      {/* ===== HEADING ===== */}
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0C2E50]">
          AISCSTEWA Units
        </h2>
        <div className="w-28 sm:w-40 h-1 bg-orange-500 mx-auto mt-4" />
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: units.length, label: "Total Units" },
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
          <div className="
              rounded-2xl
              bg-white
              px-4 sm:px-8 lg:px-12
              py-4 sm:py-6
            ">

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
              {units.map((unit, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-50 border border-orange-100 text-center">
                  <p className="font-medium text-slate-900">{unit}</p>
                </div>
              ))}
            </div>
          </div>





        </div>
      </div>
    </section>
  );
};

export default AISCSSTEWAUnits;
