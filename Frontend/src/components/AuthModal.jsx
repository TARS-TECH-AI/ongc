import React, { useEffect, useState } from "react";
import { LoginForm } from "../pages/login";
import { RegisterForm } from "../pages/register";

const AuthModal = ({ open, onClose, initialMode = "login", onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/40 backdrop-blur-sm border border-white/20 rounded-xl w-full max-w-md p-6 sm:p-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {mode === "login" ? "Login" : "Register"}
          </h3>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-md ${
                mode === "login" ? "bg-slate-100" : ""
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                mode === "register" ? "bg-slate-100" : ""
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        </div>

        {mode === "login" ? (
          <LoginForm
            onSuccess={(user) => {
              console.log("AuthModal: login success", user);
              onAuthSuccess && onAuthSuccess(user, "login");
              onClose && onClose();
            }}
          />
        ) : (
          <RegisterForm
            onSuccess={(user) => {
              console.log("AuthModal: register success", user);
              onAuthSuccess && onAuthSuccess(user, "register");
              onClose && onClose();
            }}
          />
        )}

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
