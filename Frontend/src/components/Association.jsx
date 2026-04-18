import React from "react";
import AmbedkarImg from "../assets/ambedkar1.png";
import constitutionPDF from "../assets/constitution.pdf"

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-stretch">

          {/* LEFT: Image */}
          <div className="flex justify-center items-center">
            <div className="relative rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full bg-white overflow-hidden">
              <img
                src={AmbedkarImg}
                alt="Dr. B. R. Ambedkar"
                className="w-full max-h-48 sm:max-h-80 md:max-h-96 object-contain mx-auto"
              />
              <h4 className="mt-2 text-1xl font-semibold text-slate-900 text-center">Bharat Ratna DR B.R.Ambedkar</h4>
              <p className="text-sm text-slate-600 text-center">Father of Indian Constitution</p>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="px-2 sm:px-0 mt-6 sm:mt-0">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  AISCSTEWA – CWC
                </h3>
                {/* Download button visible only when user is authenticated */}
                {typeof window !== 'undefined' && (sessionStorage.getItem('token') || sessionStorage.getItem('user')) && (
                  <a
                    href={constitutionPDF}
                    download
                    className="inline-flex items-center gap-2 px-2 py-1 bg-[#0C2E50] text-white rounded-md text-sm hover:bg-[#0a2440]"
                  >
                  Download
                  </a>
                )}
              </div>
            <p className="text-slate-700 text-sm sm:text-base">
              All India SC & ST Employees Welfare Association
            </p>
            <p className="text-slate-500 text-sm mb-5 sm:mb-6">
              Central Working Committee
            </p>

            {/* Details */}
            <div className="space-y-1 sm:space-y-3 text-slate-800 text-base sm:text-base max-w-md">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1"><span className="font-bold sm:min-w-[120px]">Established:</span><span>03 Feb 1967</span></div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1"><span className="font-bold sm:min-w-[120px]">Registration:</span><span>Registered under Societies Registration Act XXI of 1860</span></div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1"><span className="font-bold sm:min-w-[120px]">Affiliation:</span><span>ONGC Group of Companies</span></div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1"><span className="font-bold sm:min-w-[120px]">HeadOffice:</span><span>Deendayal Urja Bhawan, 5A-5B, Nelson Mandela Marg, Vasant Kunj, New Delhi -110070</span></div>
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
    </div>
  </div>
</section>
  );
};

export default AssociationIdentity;
