import React from "react";
import pdfIcon from "../assets/Vector.png";

const PdfCard = () => {
  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0C2E50]">
            AISCSSTEWA Constitution
          </h2>
          <div className="w-40 h-1 bg-orange-500 mx-auto mt-4" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center md:justify-between gap-6">
            {/* Icon */}
            <div className="shrink-0 w-16 h-16 flex items-center justify-center">
              <img src={pdfIcon} alt="PDF" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left px-2 md:px-6">
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                AISCSSTEWA Constitution (Amended 2023)
              </h3>
              <p className="text-sm text-slate-500 mt-1">PDF Document • 2.4 MB</p>
              <p className="text-sm text-slate-600 mt-2">
                Official constitution governing the structure, objectives, and functioning of AISCS&STEWA.
              </p>
            </div>

            {/* Actions */}
            <div className="flex w-full md:w-auto justify-center md:justify-end gap-3 items-center">
              <a
                href="#"
                className="text-[#0C2E50] font-medium hover:underline text-center underline"
              >
                View
              </a>

              <a
                href="#"
                download
                className="inline-block px-5 py-2 bg-[#0C2E50] text-white rounded-md hover:bg-[#0a2440] transition text-center"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PdfCard;
