import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

const PhotoGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);
  
  const loadGallery = async () => {
    try {
      console.log('Fetching gallery from:', `${API}/gallery`);
      const res = await fetch(`${API}/gallery`);
      console.log('Gallery response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gallery fetch failed:', res.status, errorText);
        throw new Error('Failed to load gallery');
      }
      
      const data = await res.json();
      console.log('Full API response:', data);
      console.log('data.items:', data.items);
      
      const imageList = data.items?.map(item => {
        console.log('Processing item:', item);
        return item.src;
      }) || [];
      
      console.log('Final image list:', imageList);
      console.log('Total images loaded:', imageList.length);
      
      setImages(imageList);
    } catch (err) {
      console.error('Error loading gallery:', err);
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
  };
  
  const openFullGallery = () => {
    setShowFullGallery(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeFullGallery = () => {
    setShowFullGallery(false);
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

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Full Gallery Page
  if (showFullGallery) {
    return (
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={closeFullGallery}
            className="flex items-center gap-2 mb-6 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Gallery</span>
          </button>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Complete Photo Gallery
            </h2>
            <div className="w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
            <p className="text-slate-600 mt-2">Total {images.length} Images</p>
          </div>

          {/* All Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => open(i)}
                className="block overflow-hidden rounded-xl shadow-lg focus:outline-none group"
              >
                <img
                  src={img}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-[240px] object-cover transform group-hover:scale-110 transition duration-300"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Lightbox Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition"
                aria-label="Close lightbox"
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
          <div className="text-center py-12 text-slate-600">
            Loading gallery...
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
                  className="w-full h-[200px] sm:h-[280px] lg:h-[320px] object-cover transform group-hover:scale-105 transition duration-300"
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
                    className="w-full h-[160px] sm:h-[200px] lg:h-[240px] object-cover transform group-hover:scale-105 transition duration-300"
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
                  className="w-full h-[160px] sm:h-[200px] lg:h-[240px] object-cover"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition"
              aria-label="Close lightbox"
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
