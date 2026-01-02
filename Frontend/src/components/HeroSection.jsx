import React, { useRef, useEffect, useState } from "react";
import Hero1 from "../assets/Img/1.png";
import Hero2 from "../assets/Img/2.png";
import Hero3 from "../assets/Img/3.png";
import Hero4 from "../assets/Img/4.png";
import Hero5 from "../assets/Img/5.png";

const HeroSection = () => {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const offsetRef = useRef(0);
  const startOffsetRef = useRef(0);

  /* ---------- MARQUEE ---------- */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let rafId;
    let lastTime = null;
    const speed = 40;

    offsetRef.current = wrapper.clientWidth;
    track.style.transform = `translateX(${offsetRef.current}px)`;

    function step(time) {
      if (pausedRef.current || draggingRef.current) {
        lastTime = time;
        rafId = requestAnimationFrame(step);
        return;
      }

      if (lastTime === null) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      offsetRef.current -= (speed * delta) / 1000;

      if (offsetRef.current <= -track.scrollWidth) {
        offsetRef.current = wrapper.clientWidth;
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;
      rafId = requestAnimationFrame(step);
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  /* ---------- SLIDESHOW ---------- */
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
    setTimeout(() => (pausedRef.current = false), 700);
  };

  return (
    <section
      id="home"
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* BACKGROUND IMAGES */}
      <div className="absolute inset-0">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 md:pt-44 pb-24">
        <div className="max-w-3xl text-white">
          {/* Heading */}
          <h1 className="font-extrabold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
            <span className="block">
              All India SC & ST Employees
            </span>
            <span className="block text-orange-400 mt-2">
              Welfare Association
            </span>
          </h1>

          {/* Motto */}
          <p className="italic text-orange-300 text-base sm:text-lg mt-5">
            "Educate • Agitate • Organise"
          </p>

          {/* Description */}
          <p className="mt-6 text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl">
            Committed to safeguarding the constitutional rights and welfare of
            SC/ST employees across all ONGC establishments nationwide.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 rounded-2xl bg-white text-gray-900 font-semibold w-full sm:w-auto">
              Learn More
            </button>
            <button className="px-8 py-3 rounded-2xl border border-white text-white w-full sm:w-auto">
              Join Community
            </button>
          </div>
        </div>
      </div>

      {/* MARQUEE */}
      <div className="absolute bottom-0 w-full bg-[#0C2E50] py-3 sm:py-4">
        <div
          ref={wrapperRef}
          className="overflow-hidden whitespace-nowrap cursor-grab px-4"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            ref={trackRef}
            className="inline-block text-orange-400 text-xs sm:text-sm font-bold"
          >
            Committee Coordinator CWC:
            <span className="text-white">
              &nbsp; Working tirelessly for the constitutional rights and social
              justice of our community.
            </span>
            &nbsp;
            <span className="font-bold">AISCSSTEWA–CWC</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
