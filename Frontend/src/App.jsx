import React, { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import Footer from "./components/Footer";
import CoreValues from "./components/CoreValues";
import President from "./components/President"
import MembersSection from "./components/MembersSection";
import PhotoGraphy from "./components/PhotoGallery";
// import Constitution from "./components/Constitution";
import Documents from "./components/Documents";
import ImportantUpdates from "./components/ImportantUpdates";
import AISCSSTEWAUnits from "./components/AISCSSTEWAUnits";
import Association from "./components/Association";
import ImportantLinks from "./components/ImportantLinks";
import ContactForm from "./components/ContactForm";
import Profile from "./pages/profile";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [currentView, setCurrentView] = useState("home");

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const isAuthenticated = Boolean(
    currentUser && sessionStorage.getItem("token")
  );

  const isApprovedUser = Boolean(
    isAuthenticated && currentUser?.status === 'Approved'
  );

  // Fetch fresh user data on mount to get latest status
  useEffect(() => {
    const refreshUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !isAuthenticated) return;

      try {
        const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';
        const res = await fetch(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched user profile:', data);
          
          // Backend returns { user: {...} }
          const userData = data.user || data;
          
          // Update user data with latest status
          const updatedUser = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            employeeId: userData.employeeId,
            status: userData.status,
            hasIdProof: !!userData.idProofDocument
          };
          
          console.log('Updated user with status:', updatedUser);
          
          // Only update if status has changed
          if (currentUser?.status !== updatedUser.status) {
            setCurrentUser(updatedUser);
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
            
            // Show notification if status changed to Approved
            if (updatedUser.status === 'Approved' && currentUser?.status === 'Pending') {
              setToast({
                message: 'Your profile has been approved! You now have access to all sections.',
                type: 'success'
              });
              setTimeout(() => setToast(null), 5000);
            }
          }
        } else {
          // Handle invalid/expired token or other auth errors by signing the user out
          console.warn('Failed to refresh user profile, status:', res.status);
          let errMsg = '';
          try {
            const text = await res.text();
            errMsg = text;
          } catch (e) {}
          if (res.status === 401 || res.status === 400) {
            // Token invalid or expired — clear session and notify user
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setCurrentUser(null);
            setToast({ message: 'Session expired, please login again', type: 'info' });
            setTimeout(() => setToast(null), 4000);
          } else {
            console.error('Unexpected profile fetch error:', errMsg || res.status);
          }
        }
      } catch (err) {
        console.error('Failed to refresh user data:', err);
      }
    };

    // Initial fetch
    refreshUserData();

    // Set up polling to check status every 30 seconds if user is authenticated
    let pollInterval;
    if (isAuthenticated) {
      pollInterval = setInterval(() => {
        refreshUserData();
      }, 30000); // Poll every 30 seconds
    }

    // Cleanup interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAuthenticated, currentUser?.status]);

  const handleAuthSuccess = (user, action) => {
    setCurrentUser(user);
    sessionStorage.setItem("user", JSON.stringify(user));

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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setCurrentUser(null);

    setToast({ message: "Logged out", type: "info" });
    setTimeout(() => setToast(null), 3000);
  };

  // Debug auth changes
  useEffect(() => {
    console.log("Auth state changed", {
      currentUser,
      token: sessionStorage.getItem("token"),
      isAuthenticated,
      isApprovedUser,
      userStatus: currentUser?.status
    });
  }, [currentUser, isAuthenticated, isApprovedUser]);

  return (
    <>
      <Navbar
        onOpenAuth={openAuth}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        onNavigate={setCurrentView}
        currentView={currentView}
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

      {currentView === "profile" ? (
        <Profile onBack={() => setCurrentView("home")} />
      ) : currentView === "gallery" ? (
        <PhotoGraphy viewMode="full" onBack={() => setCurrentView("home")} />
      ) : (
        <>
          <HeroSection onOpenAuth={openAuth} />
          <About />
          <CoreValues />
          <President/>
          <MembersSection onOpenAuth={openAuth} />
          {/* Protected Content - Only for Approved Users */}
          {isApprovedUser && (
            <>
              {/* <Constitution /> */}
              <Documents />
            </>
          )}
          {isAuthenticated && (
            <>
              <ImportantUpdates />
            </>
          )}
          <AISCSSTEWAUnits />
          <PhotoGraphy viewMode="preview" onNavigate={setCurrentView} />
          <Association isAuthenticated={isAuthenticated} currentUser={currentUser} />
          <ImportantLinks />
          <ContactForm />
          <Footer onOpenAuth={openAuth} isAuthenticated={isAuthenticated} />
        </>
      )}
    </>
  );
}

export default App;
