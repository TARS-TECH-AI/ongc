import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

const PhotoGallery = ({ viewMode = "preview", onNavigate, onBack }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadGallery();

    // Poll backend so changes made in AdminPanel (add/delete) appear
    // in the public PhotoGallery without a full page refresh.
    // Runs every 15 seconds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const intervalId = setInterval(() => loadGallery(), 15000);
    return () => clearInterval(intervalId);
  }, []);
  
  const loadGallery = async () => {
    try {
      console.log('Fetching gallery from:', `${API}/gallery`);
      const res = await fetch(`${API}/gallery`);
      
      if (!res.ok) {
        console.warn('Gallery API returned error:', res.status);
        setImages([]);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      console.log('Full API response:', data);
      
      const imageList = data.items?.map(item => item.src) || [];
      console.log('Total images loaded:', imageList.length);
      
      setImages(imageList);
    } catch (err) {
      console.warn('Gallery API error (showing empty):', err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };
  
  const VISIBLE_IMAGES = 6;
  const visibleImages = images.slice(0, VISIBLE_IMAGES);
  const remainingCount = images.length - VISIBLE_IMAGES;

  const open = (i) => {
    setIndex(i);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
    // keep navbar expanded and avoid hiding title while modal is open
    document.body.classList.add('modal-open');
  };
  
  const openFullGallery = () => {
    if (onNavigate) {
      onNavigate("gallery");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeFullGallery = () => {
    if (onBack) {
      onBack();
    }
  };

  const close = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    document.body.classList.remove('modal-open');
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

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Full Gallery Page
  if (viewMode === "full") {
    return (
      <section className="min-h-screen bg-gray-50 py-8 cursor-pointer">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={closeFullGallery}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold cursor-pointer">Back to Gallery</span>
          </button>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Complete Photo Gallery
            </h2>
            <div className="w-28 h-1 bg-orange-500 mx-auto mt-3 cursor-pointer"></div>
            <p className="text-slate-600 mt-2 cursor-pointer">Total {images.length} Images</p>
          </div>

          {/* All Images Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl shadow-lg bg-gray-200 animate-pulse cursor-pointer">
                  <div className="w-full h-48 sm:h-56 md:h-64 cursor-pointer"></div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No images in gallery yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 cursor-pointer">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => open(i)}
                  className="block overflow-hidden rounded-xl shadow-lg focus:outline-none group cursor-pointer"
                >
                  <img
                    src={img}
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transform group-hover:scale-110 transition duration-300 cursor-pointer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
            onClick={close}
          >
            <div
              className="relative max-w-[90%] max-h-[90%] w-full flex items-center justify-center cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={prev}
                className="absolute left-3 text-white p-3 rounded-full bg-black/60 hover:bg-black/80 transition cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>

              <img
                src={images[index]}
                alt={`Gallery image ${index + 1}`}
                className="max-h-[85vh] max-w-full object-contain rounded-lg cursor-pointer"
              />

              <button
                onClick={next}
                className="absolute right-3 text-white p-3 rounded-full bg-black/60 hover:bg-black/80 transition cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>

              <button
                onClick={close}
                className="absolute top-4 right-3 sm:top-6 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition cursor-pointer z-50 shadow-lg"
                aria-label="Close image"
              >
                <X size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded-full text-sm font-medium cursor-pointer">
                {index + 1} / {images.length}
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Main Gallery Preview (6 images)
  return (
    <section id="gallery" className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Photo Gallery
        </h2>
        <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Skeleton loaders */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`${i < 2 ? 'col-span-1' : ''} overflow-hidden rounded-2xl shadow-lg bg-gray-200 animate-pulse`}
              >
                <div className={`w-full ${i < 2 ? 'h-[200px] sm:h-[280px] lg:h-[320px]' : 'h-[160px] sm:h-[200px] lg:h-[240px]'}`}></div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No images in gallery yet
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* First Row - 2 large images */}
            {visibleImages.slice(0, 2).map((img, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                className="col-span-1 overflow-hidden rounded-2xl shadow-lg focus:outline-none group"
              >
                <img
                  src={img}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transform group-hover:scale-105 transition duration-300"
                />
              </button>
            ))}

            {/* Second Row - 4 smaller images (or 3 + remaining count) */}
            {visibleImages.slice(2, remainingCount > 0 ? 5 : 6).map((img, i) => {
              const actualIndex = i + 2;
              return (
                <button
                  key={actualIndex}
                  onClick={() => open(actualIndex)}
                  className="overflow-hidden rounded-2xl shadow-lg focus:outline-none group"
                >
                  <img
                    src={img}
                    alt={`Gallery image ${actualIndex + 1}`}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transform group-hover:scale-105 transition duration-300"
                  />
                </button>
              );
            })}

            {/* Last image with remaining count overlay */}
            {remainingCount > 0 && visibleImages[5] && (
              <button
                onClick={openFullGallery}
                className="relative overflow-hidden rounded-2xl shadow-lg focus:outline-none group"
              >
                <img
                  src={visibleImages[5]}
                  alt={`Gallery image 6`}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center group-hover:bg-black/80 transition">
                  <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
                    +{remainingCount}
                  </span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <div
            className="relative max-w-[90%] max-h-[90%] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={prev}
              className="absolute left-3 text-white p-3 rounded-full bg-black/60 hover:bg-black/80 transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>

            <img
              src={images[index]}
              alt={`Gallery image ${index + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />

            <button
              onClick={next}
              className="absolute right-3 text-white p-3 rounded-full bg-black/60 hover:bg-black/80 transition"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>

            <button
              onClick={close}
              className="absolute top-4 right-3 sm:top-6 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition z-50 shadow-lg"
              aria-label="Close image"
            >
              <X size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded-full text-sm font-medium">
              {index + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;
