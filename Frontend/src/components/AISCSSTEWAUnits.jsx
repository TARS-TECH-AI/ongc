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
    <img src={frameImg} alt="Frame" className="w-full h-full object-contain" />
    <div className="absolute inset-0 flex items-center justify-center px-3">
      <div className="w-[85%] h-[75%] flex items-center justify-center">
        {children}
      </div>
    </div>
  </div>
);

const regions = [
  { code: 'MR', name: 'Mumbai Region' },
  { code: 'WR', name: 'Western Region' },
  { code: 'ER', name: 'Eastern Region' },
  { code: 'SR', name: 'Southern Region' },
  { code: 'CR', name: 'Central Region' },
  { code: 'NR', name: 'Northern Region' },
];

const unitRegionMap = {
  'Agartala': 'CR',
  'Ahmedabad': 'WR',
  'Ankleshwar': 'WR',
  'Baroda': 'WR',
  'Cambay': 'WR',
  'CBM-Bokaro': 'ER',
  'Chennai': 'SR',
  'Dehradun': 'NR',
  'Delhi': 'NR',
  'Goa': 'MR',
  'Hazira': 'MR',
  'Jodhpur': 'WR',
  'Jorhat': 'ER',
  'Kakinada': 'SR',
  'Karaikal': 'SR',
  'Kolkata': 'CR',
  'Mehsana': 'WR',
  'Mumbai': 'MR',
  'Rajamundry': 'SR',
  'Silchar': 'ER',
  'Nazira/Sivasagar': 'ER',
  'Uran': 'MR',
};

const AISCSSTEWAUnits = () => {
  const [viewMode, setViewMode] = React.useState('overview'); // 'overview' | 'units' | 'regions'
  const [selectedRegion, setSelectedRegion] = React.useState(null);


  const showUnitsForRegion = (region) => {
    setSelectedRegion(region);
    setViewMode('units');
  };

  const visibleUnits = selectedRegion ? units.filter((u) => unitRegionMap[u] === selectedRegion) : units;

  return (
    <section id="units" className="w-full bg-white py-12 sm:py-16 lg:py-10">
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
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0C2E50]">
          AISCSTEWA Units
        </h2>
        <div className="w-28 sm:w-40 h-1 bg-orange-500 mx-auto mt-4" />
      </div>

      {/* ===== STATS ===== */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <div className="h-28 sm:h-36 md:h-40 lg:h-44">
            <button
              type="button"
              onClick={() => { setViewMode('units'); setSelectedRegion(null); }}
              className={`w-full h-full ${viewMode === 'units' ? 'ring-4 ring-yellow-300' : ''}`}
            >
              <FrameImage>
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0C2E50] cursor-pointer">
                    {units.length}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-[#0C2E50] cursor-pointer">
                    Total Units
                  </p>
                </div>
              </FrameImage>
            </button>
          </div>

          <div className="h-28 sm:h-36 md:h-40 lg:h-44">
            <button
              type="button"
              onClick={() => { setViewMode('regions'); setSelectedRegion(null); }}
              className={`w-full h-full ${viewMode === 'regions' ? 'ring-4 ring-yellow-300' : ''}`}
            >
              <FrameImage>
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0C2E50] cursor-pointer">
                    {regions.length}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm md:text-base font-semibold text-[#0C2E50] cursor-pointer">
                    Regions
                  </p>
                </div>
              </FrameImage>
            </button>
          </div>
        </div>
      </div>

      {/* ===== UNITS / REGIONS LIST ===== */}
      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="relative max-w-6xl mx-auto">
          {/* SCROLL AREA */}
          <div className="rounded-2xl bg-white border-2 border-yellow-500 px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
            {selectedRegion && (
              <div className="mb-3 flex justify-center">
                <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                  <span>Showing: <strong>{selectedRegion}</strong></span>
                  <button onClick={() => setSelectedRegion(null)} className="text-sm text-slate-600 underline">Clear</button>
                </div>
              </div>
            )}

            {viewMode === 'overview' ? (
              <div className="py-8 text-center text-slate-600">
                <p className="text-sm sm:text-base">Click <strong>Total Units</strong> to view all units or <strong>Regions</strong> to see region groups.</p>
                <p className="text-xs text-slate-400 mt-2">(Click any region card to view units for that region)</p>
              </div>
            ) : viewMode === 'regions' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 py-2 justify-items-center">
                {regions.map((r) => (
                  <div key={r.code} onClick={() => showUnitsForRegion(r.code)} className="w-full cursor-pointer">
                    <div className="p-4 rounded-lg bg-slate-50 border border-orange-100 text-center hover:shadow-md">
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900">{r.name} <span className="text-xs text-slate-500 ml-2">({r.code})</span></h4>
                      <p className="text-xs text-slate-600 mt-2">{units.filter((u) => unitRegionMap[u] === r.code).length} units</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 py-2 max-h-64 overflow-y-auto scrollbar-hide">
                {visibleUnits.map((unit, index) => (
                  <div key={index} className="p-2 sm:p-3 rounded-lg bg-slate-50 border border-orange-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-slate-900 truncate">{unit}</p>
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
