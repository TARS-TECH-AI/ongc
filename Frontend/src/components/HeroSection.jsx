import React, { useRef, useEffect, useState } from "react";
import Hero1 from "../assets/Img/3.png";
import Hero2 from "../assets/Img/5.png";
import Hero3 from "../assets/Img/7.png";
import Hero4 from "../assets/Img/15.png";
import Hero5 from "../assets/Img/26.png";

/* ===== MARQUEE ITEM ===== */
const MarqueeItem = () => (
  <span className="flex items-center whitespace-nowrap px-8 sm:px-12">
    Committee Coordinator CWC:
    <span className="text-white">
      &nbsp; Working tirelessly for the constitutional rights and social justice
      of our community.
    </span>
    &nbsp;
    <span className="font-bold">AISCSTEWA–CWC</span>
  </span>
);

const HeroSection = ({ onOpenAuth }) => {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);

  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const offsetRef = useRef(0);
  const startOffsetRef = useRef(0);

  /* ---------- SCROLL TO ABOUT ---------- */
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJoinCommunity = () => {
    if (onOpenAuth) onOpenAuth("login");
  };

  /* ---------- CONTINUOUS MARQUEE ---------- */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let rafId;
    let lastTime = null;
    const speed = 40;

    offsetRef.current = 0;
    track.style.transform = "translateX(0px)";

    const step = (time) => {
      if (pausedRef.current || draggingRef.current) {
        lastTime = time;
        rafId = requestAnimationFrame(step);
        return;
      }

      if (lastTime === null) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      offsetRef.current -= (speed * delta) / 1000;

      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(offsetRef.current) >= halfWidth) {
        offsetRef.current = 0;
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
      if (!pausedRef.current && !draggingRef.current) {
        setIndex((i) => (i + 1) % images.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Ensure hero starts below the fixed navbar by measuring its height
  const [navHeight, setNavHeight] = useState(0);
  useEffect(() => {
    function updateNavHeight() {
      const nav = document.querySelector('nav');
      const h = nav ? nav.getBoundingClientRect().height : 0;
      setNavHeight(h);
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

  /* ---------- DRAG HANDLERS ---------- */
  const handlePointerDown = (e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    pausedRef.current = true;
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    offsetRef.current =
      startOffsetRef.current + (e.clientX - startXRef.current);
    trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    setTimeout(() => (pausedRef.current = false), 600);
  };

  return (
    <section id="home" className="relative min-h-[100vh] w-full overflow-hidden mt-10" style={{ paddingTop: navHeight ? `${navHeight}px` : undefined }}>
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
              backgroundSize: isSmall ? 'contain' : 'cover',
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
            <span className="inline text-sm sm:text-base md:text-lg lg:text-xl">All India SC & ST Employees
              <br/> Welfare Association
               <br/>Central Working Committee
               <span className="text-orange-500 font-bold bg-linear-90 bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent"> ONGC</span></span>
          </h1>
 </div>
      </div>

      {/* ===== MARQUEE ===== */}
      <div className="absolute bottom-0 w-full bg-[#0C2E50] py-3 sm:py-4">
        <div
          ref={wrapperRef}
          className="overflow-hidden cursor-grab px-4"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            ref={trackRef}
            className="flex w-max text-orange-400 text-xs sm:text-sm font-bold"
          >
            {/* FIRST COPY */}
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />

            {/* DUPLICATE COPY */}
            <MarqueeItem />
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
