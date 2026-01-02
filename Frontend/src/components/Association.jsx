import React from "react";
import AmbedkarImg from "../assets/ambedkar.png";

const AssociationIdentity = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-0 px-4 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Association Identity
          </h2>
          <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">

          {/* LEFT: Image */}
          <div className="flex justify-center">
            <div className="relative rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full bg-white ">
              <img
                src={AmbedkarImg}
                alt="Dr. B. R. Ambedkar"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="px-2 sm:px-0 mt-4">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              AISCSSTEWA – CWC
            </h3>

            <p className="text-slate-700 text-sm sm:text-base">
              All India SC & ST Employees Welfare Association
            </p>

            <p className="text-slate-500 text-sm mb-5 sm:mb-6">
              Central Working Committee
            </p>

            {/* Details */}
            <div className="space-y-2 sm:space-y-3 text-slate-800 text-sm sm:text-base max-w-md">
              <p><strong>Established:</strong> 1982</p>
              <p><strong>Registration:</strong> Registered under Societies Registration Act</p>
              <p><strong>Affiliation:</strong> ONGC Group of Companies</p>
              <p><strong>Headquarters:</strong> ONGC Bhawan, New Delhi</p>
            </div>

            {/* Quote */}
            <div className="mt-6 sm:mt-8 border border-slate-300 rounded-lg p-4 sm:p-6 relative max-w-lg">
              <div className="absolute left-0 top-0 h-full w-1.5 sm:w-2 bg-yellow-500 rounded-l-lg" />
              <p className="italic text-slate-700 leading-relaxed pl-4 text-sm sm:text-base">
                "Working towards social justice, equal opportunities, and welfare
                of SC/ST employees while upholding the constitutional values
                enshrined by Dr. B. R. Ambedkar."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssociationIdentity;
