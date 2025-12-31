import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Images
import P1 from "../assets/PhotoImg/P1.png";
import P2 from "../assets/PhotoImg/P2.png";
import P3 from "../assets/PhotoImg/P3.png";
import P4 from "../assets/PhotoImg/P4.png";
import P5 from "../assets/PhotoImg/P5.png";

const images = [P1, P2, P3, P4, P5];

const PhotoGallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const open = (i) => {
    setIndex(i);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // cleanup if component unmounts while modal is open
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <section id="gallery" className="py-12 sm:py-16 lg:py-0 mb-20 bg-white overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Photo Gallery
        </h2>
        <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => open(i)}
              className="block overflow-hidden rounded-xl focus:outline-none"
            >
              <img
                src={img}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-[220px] sm:h-[240px] lg:h-[260px] object-cover rounded-xl transform hover:scale-105 transition"
              />
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={close}
        >
          <div
            className="relative max-w-[90%] max-h-[90%] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            <button
              onClick={prev}
              className="absolute left-3 text-white p-2 rounded-full bg-black/40 hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>

            {/* Image */}
            <img
              src={images[index]}
              alt={`Gallery image ${index + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />

            {/* Next */}
            <button
              onClick={next}
              className="absolute right-3 text-white p-2 rounded-full bg-black/40 hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>

            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full"
              aria-label="Close lightbox"
            >
              <X />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/40 px-3 py-1 rounded-full text-sm">
              {index + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;
