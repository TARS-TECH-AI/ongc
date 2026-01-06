import React, { useRef, useEffect, useState } from "react";
import Hero1 from "../assets/Img/1.png";
import Hero2 from "../assets/Img/2.png";
import Hero3 from "../assets/Img/3.png";
import Hero4 from "../assets/Img/4.png";
import Hero5 from "../assets/Img/5.png";

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!pausedRef.current && !draggingRef.current) {
        setIndex((i) => (i + 1) % images.length);
      }
    }, 5000);

    return () => clearInterval(interval);
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
    <section id="home" className="relative min-h-[100svh] w-full overflow-hidden ">
      {/* ===== BACKGROUND ===== */}
      <div className="absolute inset-0">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 sm:pb-24 md:pb-32">
        <div className="max-w-2xl text-white text-left ml-2 sm:ml-4 md:ml-8 lg:ml-12">
          <h1 className="font-extrabold leading-tight text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-lg">
            <span className="inline">All India SC & ST Employees Welfare Association</span>
          </h1>

          <p className="italic text-orange-300 text-base sm:text-lg mt-4 drop-shadow-lg">
            "Educate • Agitate • Organise"
          </p>

          <p className="mt-5 text-white/95 text-sm sm:text-base md:text-lg max-w-2xl drop-shadow-lg">
            Committed to safeguarding the constitutional rights and welfare of
            SC/ST employees across all ONGC establishments nationwide.
          </p>

          <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToAbout}
              className="px-8 py-3 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow-xl cursor-pointer"
            >
              Learn More
            </button>
            <button
              onClick={handleJoinCommunity}
              className="px-8 py-3 rounded-2xl border-2 border-white text-white hover:bg-white/10 transition shadow-xl backdrop-blur-sm cursor-pointer"
            >
              Join Community
            </button>
          </div>
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
