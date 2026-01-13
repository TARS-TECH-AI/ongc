import React from "react";

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

const regions = [
  { code: "MR", name:"Mumbai Region" },
  { code: "WR", name:"Western Region" },
  { code: "ER", name:"Eastern Region" },
  { code: "SR", name:"Southern Region" },
  { code: "CR", name:"Central Region" },
  { code: "NR", name:"Northern Region" },
];

const unitRegionMap = {
  Agartala: "CR",
  Ahmedabad: "WR",
  Ankleshwar: "WR",
  Baroda: "WR",
  Cambay: "WR",
  "CBM-Bokaro": "ER",
  Chennai: "SR",
  Dehradun: "NR",
  Delhi: "NR",
  Goa: "MR",
  Hazira: "MR",
  Jodhpur: "WR",
  Jorhat: "ER",
  Kakinada: "SR",
  Karaikal: "SR",
  Kolkata: "CR",
  Mehsana: "WR",
  Mumbai: "MR",
  Rajamundry: "SR",
  Silchar: "ER",
  "Nazira/Sivasagar": "ER",
  Uran: "MR",
};

const AISCSSTEWAUnits = () => {
  const [viewMode, setViewMode] = React.useState("overview"); // 'overview' | 'units' | 'regions'
  const [selectedRegion, setSelectedRegion] = React.useState(null);

  const showUnitsForRegion = (region) => {
    setSelectedRegion(region);
    setViewMode("units");
  };

  const visibleUnits = selectedRegion
    ? units.filter((u) => unitRegionMap[u] === selectedRegion)
    : units;

  return (
    <section id="units" className="w-full bg-white py-12 sm:py-16 lg:py-0">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            scrollbar-width: none;
          }
        `}
      </style>
      {/* ===== HEADING ===== */}
      <div className="max-w-7xl mx-auto px-4 text-center lg:mt-0 -mt-15">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0C2E50]">
          AISCSTEWA Units
        </h2>
        <div className="w-28 sm:w-40 h-1 bg-orange-500 mx-auto mt-4" />
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-4xl mx-auto px-2 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="h-15 sm:h-24 md:h-28 lg:h-30">
            <button
              type="button"
              aria-pressed={viewMode === "units"}
              onClick={() => {
                setViewMode("units");
                setSelectedRegion(null);
              }}
              className={`w-full sm:w-auto md:min-w-[300px] h-full flex flex-col items-center justify-center rounded-lg text-white shadow-md px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 active:translate-y-[1px] transition-all cursor-pointer ${
                viewMode === "units"?"ring-4 ring-yellow-300" : ""
              }`}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  {units.length}
                </div>
                <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold">
                  Total Units
                </p>
              </div>
            </button>
          </div>

          <div className="h-15 sm:h-24 md:h-28 lg:h-30">
            <button
              type="button"
              aria-pressed={viewMode==="regions"}
              onClick={() => {
                setViewMode("regions");
                setSelectedRegion(null);
              }}
              className={`w-full sm:w-auto md:min-w-[300px] h-full flex flex-col items-center justify-center rounded-lg text-white shadow-md px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 active:translate-y-[1px] transition-all cursor-pointer ${
                viewMode === "regions" ? "ring-4 ring-yellow-300" : ""
              }`}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                  {regions.length}
                </div>
                <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold">
                  Regions
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ===== UNITS / REGIONS LIST ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="relative max-w-5xl mx-auto">
          {/* SCROLL AREA */}
          <div className="rounded-2xl bg-white border-2 border-yellow-500 px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
            {selectedRegion && (
              <div className="mb-3 flex justify-center">
                <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                  <span>
                    Showing: <strong>{selectedRegion}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-sm text-slate-600 underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {viewMode === "overview" ? (
              <div className="py-8 text-center text-slate-600">
                <p className="text-sm sm:text-base">
                  Click <strong>Total Units</strong> to view all units or{" "}
                  <strong>Regions</strong> to see region groups.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  (Click any region card to view units for that region)
                </p>
              </div>
            ) : viewMode === "regions" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2 justify-items-center">
                {regions.map((r) => (
                  <div
                    key={r.code}
                    onClick={() => showUnitsForRegion(r.code)}
                    className="w-full cursor-pointer"
                  >
                    <div className="p-4 rounded-lg text-center">
                      <h4 className="text-sm sm:text-base font-semibold text-[#0C2E50]">
                        {r.name}{" "}
                        <span className="text-xs text-[#0C2E50] ml-2">
                          ({r.code})
                        </span>
                      </h4>
                      <p className="text-xs text-[#0C2E50] mt-2">
                        {
                          units.filter((u) => unitRegionMap[u] === r.code)
                            .length
                        }{" "}
                        units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-2 max-h-64 overflow-y-auto scrollbar-hide">
                {visibleUnits.map((unit, index) => (
                  <div key={index} className="p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-[#0C2E50] truncate">
                        {unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISCSSTEWAUnits;
