import React from "react";
import about1 from "../assets/about.png";
// import about2 from "../assets/about2.png";

const About = () => {
  return (
    <section id="about" className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            About Us
            <span className="block h-1 w-16 bg-orange-400 mx-auto mt-3 rounded"></span>
          </h2>

          <p className="mt-6 text-gray-600 text-sm sm:text-base leading-relaxed">
            All India SC & ST Employees Welfare Association (AISCS&STEWA) is a
            registered organization dedicated to protecting the constitutional
            rights and promoting the welfare of Scheduled Caste and Scheduled
            Tribe employees working in ONGC and its affiliated establishments.
          </p>
        </div>

        {/* Content */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Left Cards */}
          <div className="space-y-6">
            {/* Mission */}
            <div className="bg-gray-100 rounded-xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-1xl sm:text-3xl lg:text-4xl flex items-center gap-2 text-base  font-bold text-slate-900">
                 Our Mission
              </h3>
              <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                To create an equitable and inclusive work environment where every
                SC/ST employee can thrive with dignity, respect, and equal
                opportunities. We envision a society where constitutional
                provisions are fully implemented and the principles of social
                justice are upheld at every level of the organization.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-gray-100 rounded-xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-1xl sm:text-3xl lg:text-4xl flex items-center gap-2 text-base font-bold text-slate-900">
                 Our Vision
              </h3>
              <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                To safeguard the interests and rights of SC/ST employees through
                collective representation, policy advocacy, and continuous
                engagement with management. We are committed to ensuring proper
                implementation of reservation policies, addressing grievances,
                and fostering unity among our community members.
              </p>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-64 sm:w-72 md:w-80 lg:w-96">
              
              {/* First Image */}
              <div className="relative">
                <img
                  src={about1}
                  alt="Industry"
                  className="rounded-xl w-full"
                />
                {/* Border Outline
                <div className="absolute -top-2 -left-2 w-full h-full border-2 border-blue-800 rounded-xl pointer-events-none"></div> */}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
