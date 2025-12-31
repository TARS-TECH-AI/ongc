import React, { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import Footer from "./components/Footer";
import CoreValues from "./components/CoreValues";
import MembersSection from "./components/MembersSection";
import PhotoGraphy from "./components/PhotoGallery";
import Constitution from "./components/Constitution";
import Documents from "./components/Documents";
import ImportantUpdates from "./components/ImportantUpdates";
import AISCSSTEWAUnits from "./components/AISCSSTEWAUnits";
import Association from "./components/Association";
import ImportantLinks from "./components/ImportantLinks";
import ContactForm from "./components/ContactForm";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const isAuthenticated = Boolean(
    currentUser && localStorage.getItem("token")
  );

  const handleAuthSuccess = (user, action) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));

    setToast({
      message:
        action === "register"
          ? `Welcome, ${user.name}! Your registration is complete.`
          : `Welcome back, ${user.name}!`,
      type: "success",
    });

    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);

    setToast({ message: "Logged out", type: "info" });
    setTimeout(() => setToast(null), 3000);
  };

  // Debug auth changes
  useEffect(() => {
    console.log("Auth state changed", {
      currentUser,
      token: localStorage.getItem("token"),
      isAuthenticated,
    });
  }, [currentUser, isAuthenticated]);

  return (
    <>
      <Navbar
        onOpenAuth={openAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999]">
          <div
            className={`px-4 py-2 rounded-md shadow-md text-white ${
              toast.type === "success"
                ? "bg-green-600"
                : "bg-gray-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <HeroSection />
      <About />
      <CoreValues />
      <MembersSection />
      <Constitution />
      {/* Protected Content */}
      {isAuthenticated && (
        <>
          <Documents />
          <ImportantUpdates />
        </>
      )}
      <AISCSSTEWAUnits />
      <PhotoGraphy />
      <Association />
      <ImportantLinks />
      <ContactForm />
      <Footer onOpenAuth={openAuth} isAuthenticated={isAuthenticated} />
    </>
  );
}

export default App;
