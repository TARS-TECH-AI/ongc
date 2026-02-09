import React, { useEffect, useState } from "react";

import Hero1 from "../assets/Img/3.png";
import Hero2 from "../assets/Img/5.png";
import Hero3 from "../assets/Img/7.png";
import Hero4 from "../assets/Img/15.png";
import Hero5 from "../assets/Img/26.png";

/* ===== MARQUEE ITEM ===== */
const MarqueeItem = () => (
  <span className="flex items-center whitespace-nowrap">
    "Great Dr. Babasaheb Ambedkar thought:
    <span className="text-white">&nbsp;&nbsp;Educate</span>
    &nbsp;&nbsp;
    <span className="font-bold">Agitate</span>
    &nbsp;&nbsp;
    <span className="text-white">Organize"</span>
  </span>
);

const HeroSection = ({ onOpenAuth }) => {
  const [navHeight, setNavHeight] = useState(0);
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJoinCommunity = () => {
    if (onOpenAuth) onOpenAuth("login");
  };



  /* ---------- BACKGROUND SLIDESHOW ---------- */
  const images = [Hero1, Hero2, Hero3, Hero4, Hero5];
  const [index, setIndex] = useState(0);

  // Detect small screens so we can use `contain` for background images on mobile
  const [isSmall, setIsSmall] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Ensure hero starts below the fixed navbar by measuring its height
  useEffect(() => {
    function updateNavHeight() {
      const nav = document.querySelector('nav');
      const h = nav ? nav.getBoundingClientRect().height : 0;
      // Only apply nav height for medium+ screens. On mobile the nav can expand/overlay,
      // which would otherwise push the hero down and change its height — we avoid that.
      if (window.innerWidth >= 768) {
        setNavHeight(h);
      } else {
        setNavHeight(0);
      }
    }

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    // Observe for changes to navbar size (in case content changes)
    const navEl = document.querySelector('nav');
    let observer;
    if (navEl && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(updateNavHeight);
      observer.observe(navEl, { attributes: true, childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', updateNavHeight);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <section id="home" className="relative min-h-[85vh] md:min-h-[100vh] w-full overflow-hidden mt-22" style={{ paddingTop: !isSmall && navHeight ? `${navHeight}px` : undefined }}>
      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0 lg:mt-10 ">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#000',
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none" />
      </div>
          


      {/* ===== CONTENT ===== */}
      <div className="absolute bottom-16 left-0 z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl text-white text-left">
          <h1 className="font-semibold leading-tight text-xs sm:text-sm md:text-base lg:text-lg drop-shadow-lg">
            <span className="inline text-sm sm:text-base md:text-lg lg:text-xl"><span className="sm:text-2xl sm:mt-5">All India SC & ST Employees</span>
              <br/> <span className="sm:text-2xl">Welfare Association</span>
               <br/><span className="sm:text-2xl">Central Working Committee</span>
               <span className="text-orange-500 font-bold bg-linear-90 bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent"> ONGC</span></span>
          </h1>
        </div>
      </div>

      {/* ===== MARQUEE ===== */}
      <div className="absolute bottom-0 w-full bg-[#0C2E50] py-3 sm:py-4">
        <div className="px-4 overflow-hidden hide-scrollbar">
          <div className="marquee">
            <div className="marquee-track inline-flex items-center">
              {[...Array(8)].map((_, i) => (
                <div key={`m-${i}`} className="mx-8 whitespace-nowrap text-orange-400 text-xs sm:text-sm font-bold">
                  <MarqueeItem />
                </div>
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`m2-${i}`} className="mx-8 whitespace-nowrap text-orange-400 text-xs sm:text-sm font-bold">
                  <MarqueeItem />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;