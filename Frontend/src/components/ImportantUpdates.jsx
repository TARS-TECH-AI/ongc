import React, { useState, useEffect } from "react";
import { Bell, CalendarDays, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "https://ongc-q48j.vercel.app/api";

const UpdateCard = ({ item, onReadMore }) => (
  <div 
    className="flex gap-4 py-5 sm:py-6 border-b last:border-b-0 px-3 rounded-md"
  >
    {/* Icon */}
    <div
      className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-full ${
        item.highlight ? "bg-orange-400" : "bg-gray-200"
      }`}
    >
      <Bell
        className={item.highlight ? "text-white" : "text-slate-700"}
        size={20}
      />
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm mb-1">
        {item.highlight && (
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap bg-orange-400 text-white">
            New
          </span>
        )}

        <span className="flex items-center gap-1 text-slate-500 text-xs sm:text-sm">
          <CalendarDays size={14} />
          {item.date}
        </span>
      </div>

      <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
        {item.title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
        <strong>Venue:</strong> {item.venue}
      </p>

      {item.description && (
        <div className="mt-2">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          {item.description.split(/\s+/).length > 20 && (
            <button 
              onClick={onReadMore}
              className="text-orange-500 hover:text-orange-600 text-xs font-medium mt-1 transition"
            >
              Read More
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

const ImportantUpdates = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && (sessionStorage.getItem('token') || sessionStorage.getItem('user'));

  useEffect(() => {
    loadUpdates();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedUpdate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedUpdate]);

  const loadUpdates = async () => {
    try {
      const res = await fetch(`${API}/updates`);
      if (res.ok) {
        const data = await res.json();
        console.log('Loaded updates:', data.updates);
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error("Failed to load updates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Separate upcoming and past updates
  const upcomingUpdates = updates.filter((u) => u.isUpcoming);
  const pastUpdates = updates.filter((u) => !u.isUpcoming);

  // Format update for UpdateCard
  const formatUpdate = (update, isHighlight = false) => ({
    title: update.title,
    venue: update.venue,
    description: update.description,
    date: new Date(update.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    highlight: isHighlight,
  });

  return (
    <section id="updates" className="w-full bg-white py-20 sm:py-24 lg:py-15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10 lg:mt-0 -mt-15">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0C2E50]">
            Important Updates
          </h2>
          <div className="w-24 sm:w-32 h-1 bg-orange-400 mx-auto mt-3" />
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Loading updates...</p>
        ) : (
          /* Content */
          <div className="relative min-h-[300px]">
            <div className={isAuthenticated ? '' : 'blur-md pointer-events-none select-none'}>
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

                {/* Center Divider (desktop only) */}
                <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-slate-300" />

                {/* Left Column - Upcoming Events (New) */}
                <div className="md:pr-8 lg:pr-12">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Upcoming Events
                  </h3>
                  {upcomingUpdates.length > 0 ? (
                    upcomingUpdates.map((item, i) => (
                      <UpdateCard 
                        key={`upcoming-${i}`} 
                        item={formatUpdate(item, true)} 
                        onReadMore={() => {
                          console.log('Selected update:', item);
                          setSelectedUpdate(item);
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm py-4">No upcoming events</p>
                  )}
                </div>

                {/* Right Column - Past Events */}
                <div className="md:pl-8 lg:pl-12">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Past Events
                  </h3>
                  {pastUpdates.length > 0 ? (
                    pastUpdates.map((item, i) => (
                      <UpdateCard 
                        key={`past-${i}`} 
                        item={formatUpdate(item, false)} 
                        onReadMore={() => {
                          console.log('Selected update:', item);
                          setSelectedUpdate(item);
                        }}
                      />
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm py-4">No past events</p>
                  )}
                </div>

              </div>
            </div>

            {!isAuthenticated && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 rounded-lg">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-6 rounded-md text-center max-w-sm z-40">
                  <p className="text-white mb-4 font-medium">
                    Please login or register to view important updates
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        if (onOpenAuth) return onOpenAuth('login');
                        navigate('/login');
                      }}
                      className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenAuth) return onOpenAuth('register');
                        navigate('/register');
                      }}
                      className="bg-transparent border border-white/30 text-white px-4 py-2 rounded hover:bg-white/5"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Update Details Modal */}
        {selectedUpdate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-24 pb-0">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] relative shadow-2xl mt-0 mb-0">
              <button
                onClick={() => {
                  setSelectedUpdate(null);
                  setIsDescriptionExpanded(false);
                }}
                className="sticky top-0 left-full -translate-x-12 translate-y-4 text-slate-400 hover:text-slate-600 transition z-50 bg-white rounded-full p-1 shadow-md"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto max-h-[calc(80vh-2rem)] p-6 pt-2">
                <div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-orange-500" />
                  <span className="text-sm text-slate-500">
                    {new Date(selectedUpdate.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {selectedUpdate.isUpcoming && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded">
                      Upcoming
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-2">
                  {selectedUpdate.title}
                </h3>
                <p className="text-sm text-slate-700 mt-2">
                  <strong>Venue:</strong> {selectedUpdate.venue}
                </p>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-800">Description</h4>
                  {(() => {
                    const description = selectedUpdate.description || 'No description available';
                    const words = description.split(/\s+/);
                    const wordCount = words.length;
                    const shouldTruncate = wordCount > 100;
                    const displayText = shouldTruncate && !isDescriptionExpanded 
                      ? words.slice(0, 100).join(' ') + '...'
                      : description;

                    return (
                      <>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {displayText}
                        </p>
                        {shouldTruncate && (
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="mt-3 text-orange-500 hover:text-orange-600 font-medium text-sm transition"
                          >
                            {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ImportantUpdates;
