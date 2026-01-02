import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/Logo.png";
import ProfileImg from "../assets/Profile.png";

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
    <nav className="fixed top-0 w-full z-[999] bg-gradient-to-b from-white via-white/90 to-transparent">
      <div className="max-w-7xl mx-auto px-4">
        {/* NAVBAR ROW */}
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* LOGO */}
          <img
            src={Logo}
            alt="logo"
            onClick={() => {
              onNavigate && onNavigate('home');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
            className="
              w-20 h-20
              sm:w-24 sm:h-24
              md:w-28 md:h-28
              lg:w-32 lg:h-32
              object-contain
              cursor-pointer
            "
          />

          {/* DESKTOP MENU */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
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
                className={`cursor-pointer transition ${
                  activeSection === item.id 
                    ? 'text-orange-500 font-semibold' 
                    : 'hover:text-orange-500'
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-3">
            {onOpenAuth && !currentUser && (
              <>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="px-8 py-2 rounded-md bg-[#0C2E50] hover:bg-[#0b2948] text-white text-sm cursor-pointer"
                >
                  Register
                </button>
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-8 py-2 rounded-md border text-sm hover:bg-slate-50 cursor-pointer"
                >
                  Login
                </button>
              </>
            )}

            {currentUser && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu((s) => !s)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer"
                >
                  <img src={currentUser.profileUrl || ProfileImg} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
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
                activeSection === item.id 
                  ? 'text-orange-500 font-semibold border-b-2 border-orange-500' 
                  : 'hover:text-orange-500'
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

          <div className="flex flex-col gap-3 pt-4">
            {!currentUser && (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenAuth && onOpenAuth("register");
                  }}
                  className="bg-[#0C2E50] text-white py-2 rounded-md"
                >
                  Register
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    onOpenAuth && onOpenAuth("login");
                  }}
                  className="border py-2 rounded-md"
                >
                  Login
                </button>
              </>
            )}

            {currentUser && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <img src={currentUser.profileUrl || ProfileImg} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                  <div className="text-sm font-semibold">
                    {currentUser.name}
                  </div>
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
