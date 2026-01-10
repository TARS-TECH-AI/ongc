import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/Logo.png";
import Logo2 from "../assets/ongc.png";
import nav_babashaheb from "../assets/NavImg/babashaheb.png";
import nav_chhtrapati from "../assets/NavImg/chhtrapati.png";
import nav_Gandhi from "../assets/NavImg/Gandhi.png";
import nav_jyotiba from "../assets/NavImg/jyotiba.png";
import nav_lokmanya from "../assets/NavImg/lokmanya.png";
import nav_savitribai from "../assets/NavImg/savitribai.png";
import nav_bhimbori from "../assets/NavImg/bhimbori.jpg";
import nav_bhupen_h from "../assets/NavImg/bhupen_h.png"

const Carousel = ({ images = [], interval = 2500, className = "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain" }) => {
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => {
      setIdx((s) => (s + 1) % images.length);
    }, interval);
    return () => clearInterval(t);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <img src={images[idx]} alt={`nav-${idx}`} className={className} />
  );

};

const Navbar = ({ onOpenAuth, currentUser, onLogout, isAuthenticated, onNavigate, currentView }) => {
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const profileRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Scroll spy effect
  useEffect(() => {
    if (currentView !== 'home') {
      setActiveSection('');
      return;
    }


    const handleScroll = () => {
      const sections = ["home", "about", "members", "documents", "updates", "units", "gallery"];
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const links = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Members", id: "members" },
    { label: "Documents", id: "documents", restricted: true },
    { label: "Updates", id: "updates", restricted: true },
    { label: "AISCTEWA Units", id: "units" },
    { label: "Gallery", id: "gallery" },
  ];

  return (
    <nav className="fixed top-0 w-full z-[1000] bg-gray-50 shadow-lg">
      <div className="max-w-full mx-auto px-4">
        {/* NAVBAR ROW */}
        <div className="flex items-center justify-between py-1 md:py-2">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <div className="flex items-center mr-3 pl-0 lg:pl-0">
              <Carousel images={[nav_babashaheb, nav_chhtrapati, nav_Gandhi, nav_jyotiba, nav_lokmanya, nav_savitribai,nav_bhimbori,nav_bhupen_h]} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain" />
            </div>

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              onNavigate && onNavigate('home');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            role="button"
            aria-label="Go to home"
          >
            <img
              src={Logo2}
              alt="ONGC Emblem"
              className="h-10 sm:h-14 md:h-16 lg:h-12 object-contain"
            />
            <img
              src={Logo}
              alt="ONGC Logo"
              className="h-10 sm:h-14 md:h-16 lg:h-18 object-contain"
            />
            <div className="text-black leading-tight font-bold">
              <p className="m-0 text-base sm:text-lg md:text-xl font-bold whitespace-nowrap" style={{fontFamily:"Poppins"}}>All India SC&ST Employees Welfare Association</p>
              <p className="m-0 text-sm sm:text-base" style={{fontFamily:"Poppins"}}>Central Working Committee
              <span className="text-orange-500 font-bold bg-linear-90 bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent"> ONGC</span></p>
            </div>
          </div>
          </div>

          {/* DESKTOP MENU */}
          <ul className="hidden lg:flex items-center justify-center flex-1 text-sm font-medium text-slate-700 pt-8">
            {links.map((item, i) => (
              <li
                key={i}
                onClick={() => {
                  setOpen(false);
                  // restricted -> require auth
                  if (item.restricted && !isAuthenticated) {
                    onOpenAuth && onOpenAuth('login');
                    return;
                  }
                  // Navigate to home if on different view
                  if (currentView !== 'home') {
                    onNavigate && onNavigate('home');
                    setTimeout(() => {
                      if (item.id) {
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  } else if (item.id) {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`cursor-pointer transition flex-1 text-center px-4  ${
                  activeSection === item.id ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'
                } ${item.id === 'units' ? 'whitespace-nowrap' : ''}`}
              >
                {item.label}
              </li>
            ))}
          </ul>

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-3 ml-6 pt-8">
            {onOpenAuth && !currentUser && (
              <button
                onClick={() => onOpenAuth("login")}
                className="px-8 py-2 rounded-md border text-sm cursor-pointer bg-[#0C2E50] text-white"
              >
                Login
              </button>
            )}

            {currentUser && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu((s) => !s)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#0C2E50] flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-base font-semibold text-slate-900">
                    {currentUser.name}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50">
                    <button
                      onClick={() => {
                        onNavigate && onNavigate('profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout && onLogout();
                        onNavigate && onNavigate('home');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button
            onClick={() => setOpen(!open)}
            className="
              lg:hidden
              flex items-center justify-center
              w-10 h-10 sm:w-11 sm:h-11
              rounded-md
              bg-white shadow-md
              text-slate-900
              active:scale-95
              transition
            "
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          lg:hidden
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          bg-white shadow-md
        `}
      >
        <ul className="flex flex-col gap-4 px-6 py-6 text-sm">
          {links.map((item, i) => (
            <li
              key={i}
              className={`pb-2 cursor-pointer transition ${
                (item.id === 'home' ? 'ml-6 ' : '') + (activeSection === item.id 
                  ? 'text-orange-500 font-semibold  border-orange-500' 
                  : 'hover:text-orange-500') + (item.id === 'units' ? ' whitespace-nowrap' : '')
              }`}
              onClick={() => {
                setOpen(false);
                if (item.restricted && !isAuthenticated) return onOpenAuth && onOpenAuth('login');
                // Navigate to home if on different view
                if (currentView !== 'home') {
                  onNavigate && onNavigate('home');
                  setTimeout(() => {
                    if (item.id) {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                } else if (item.id) {
                  const el = document.getElementById(item.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {item.label}
            </li>
          ))}

            <div className="flex flex-col gap-3 pt-4 ">
            {!currentUser && (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenAuth && onOpenAuth("login");
                  }}
                  className="border py-2 rounded-md bg-[#0C2E50] text-white"
                >
                  Login
                </button>
              </>
            )}

            {currentUser && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* <div className="w-9 h-9 rounded-full bg-gradient-to-br bg-[#0C2E50] flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-sm font-semibold">
                    {currentUser.name}
                  </div> */}
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    onNavigate && onNavigate('profile');
                  }}
                  className="w-full border py-2 rounded-md"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout && onLogout();
                    onNavigate && onNavigate('home');
                  }}
                  className="w-full border py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
