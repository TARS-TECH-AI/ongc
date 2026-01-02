import React from "react";
import corevalueImage from "../assets/Img/7.png";
import justiceImg from "../assets/justice.png";
import unityImg from "../assets/unity.png";
import processImg from "../assets/Process.png";
import integrityImg from "../assets/Integrity.png";

const values = [
  {
    img: justiceImg,
    title: "Justice",
    desc: "Upholding constitutional rights and social equity",
  },
  {
    img: unityImg,
    title: "Unity",
    desc: "Strength through collective solidarity",
  },
  {
    img: processImg,
    title: "Progress",
    desc: "Continuous advancement and development",
  },
  {
    img: integrityImg,
    title: "Integrity",
    desc: "Transparent and ethical governance",
  },
];

const CoreValues = () => {
  return (
    <section className="w-full px-4 py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Background Card */}
        <div
          className="rounded-2xl overflow-hidden bg-cover bg-center shadow-lg"
          style={{ backgroundImage: `url(${corevalueImage})` }}
        >
          {/* Overlay */}
          <div className="bg-gradient-to-b from-black/70 via-black/50 to-black/30 px-4 sm:px-6 py-10 sm:py-12">
            <div className="max-w-6xl mx-auto text-center">

              {/* Heading */}
              <h3 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-8 sm:mb-12">
                Our Core Values
              </h3>

              {/* Values Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {values.map((item) => (
                  <div
                    key={item.title}
                    className="px-3 py-5 sm:px-4 sm:py-6 flex flex-col items-center"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title */}
                    <h4 className="text-white font-semibold text-base sm:text-lg">
                      {item.title}
                    </h4>

                    {/* Description */}
                    <p className="text-white/95 text-xs sm:text-sm mt-2 max-w-[200px] sm:max-w-[220px]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CoreValues;
