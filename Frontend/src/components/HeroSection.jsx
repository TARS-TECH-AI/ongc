import React, { useRef, useEffect, useState } from "react";
import Hero1 from "../assets/Hero1.jpg";
import Hero2 from "../assets/Hero2.png";
import Hero3 from "../assets/Hero3.png";
import Hero4 from "../assets/Hero4.png";
import Hero5 from "../assets/Hero5.png";

const HeroSection = () => {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const offsetRef = useRef(0);
  const startOffsetRef = useRef(0);

  /* ---------- MARQUEE LOGIC (UNCHANGED) ---------- */
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
  }, [images.length]);

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    wrapperRef.current.style.cursor = "grabbing";
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
    wrapperRef.current.style.cursor = "grab";
    setTimeout(() => (pausedRef.current = false), 800);
  };

  return (
    <section id="home" className="relative min-h-screen w-full">
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {images.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-36 md:pt-44 pb-20">
        <div className="max-w-3xl text-white">
          {/* Heading */}
          <h1 className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
            <span className="block sm:whitespace-nowrap">
              All India SC & ST Employees
            </span>
            <span className="block text-orange-400 mt-2">
              Welfare Association
            </span>
          </h1>

          {/* Motto */}
          <p className="italic text-orange-300 text-base sm:text-lg mt-6">
            "Educate • Agitate • Organise"
          </p>

          {/* Description */}
          <p className="mt-6 text-white/90 max-w-4xl text-base sm:text-lg md:text-xl lg:text-xl">
            <span className="block">
              Committed to safeguarding the constitutional rights and welfare of
 SC/ST employees
            </span>
            <span className="block mt-1">
              across all ONGC establishments nationwide.
            </span>
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 rounded-2xl bg-white text-sky-700 font-semibold w-full sm:w-auto cursor-pointer">
              Learn More
            </button>
            <button className="px-8 py-3 rounded-2xl border border-white w-full sm:w-auto cursor-pointer">
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
            <span className="font-bold">AISCS&STEWA–CWC</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
