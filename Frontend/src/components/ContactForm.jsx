import React, { useState, useEffect } from "react";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";

const ContactCard = () => (
  <div className="bg-white rounded-xl border border-[#5b6f8f] p-6 sm:p-8 lg:p-10 h-full">
    <h3 className="text-2xl sm:text-3xl font-bold text-[#0C2E50] mb-6 sm:mb-8">
      Central Office
    </h3>

    <div className="space-y-6 sm:space-y-8 text-[#0C2E50]">
      <div className="flex items-start gap-4">
        <MapPin className="w-5 h-5 mt-1" />
        <div>
          <p className="font-semibold">AISCS&STEWA – CWC</p>
          <p className="text-sm leading-relaxed mt-2 text-slate-700">
            ONGC Bhawan, Jeevan Bharti Building, Tower II, 3rd Floor,
            <br />
            124, Connaught Circus,
            <br />
            New Delhi – 110001
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <Phone className="w-5 h-5 mt-1" />
        <div>
          <p className="font-semibold">+91-11-23456789</p>
          <p className="text-sm text-slate-600">Mon–Fri, 10 AM – 5 PM</p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <Mail className="w-5 h-5 mt-1" />
        <p className="font-semibold break-all">Contact@aiscstewa.org</p>
      </div>
    </div>
  </div>
);

const ContactForm = ({ openAuth, currentUser, isAuthenticated }) => {
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authWarning, setAuthWarning] = useState(null);

  useEffect(() => {
    // keep form in sync with currentUser and clear auth warning once user logs in
    setForm((s) => ({ ...s, name: currentUser?.name || "", email: currentUser?.email || "" }));
    if (currentUser || sessionStorage.getItem('token')) {
      setAuthWarning(null);
    }
  }, [currentUser]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localIsAuth = typeof isAuthenticated !== 'undefined' ? isAuthenticated : Boolean(sessionStorage.getItem('token'));
    if (!localIsAuth) {
      setAuthWarning('Please register or login before sending a message.');
      return;
    }

    setAuthWarning(null);
    setSubmitting(true);
    try {
      const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      // robust parsing: handle empty/non-json responses
      const text = await res.text();
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch (err) { json = {}; }
      if (!res.ok) throw new Error(json.message || 'Failed to send');
      setSubmitted(true);
      setForm((s) => ({ ...s, subject: "", message: "" }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0C2E50]">
            Contact Us
          </h2>
          <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3 sm:mt-4" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-stretch">
          <ContactCard />

          <div className="w-full">
            {authWarning && (
              <div className="mb-6 max-w-3xl mx-auto p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center justify-between">
                <span>{authWarning}</span>
                <div className="flex gap-3">
                  <button onClick={() => openAuth && openAuth('register')} className="px-3 py-1 bg-[#0C2E50] text-white rounded-md text-sm">Register</button>
                  <button onClick={() => openAuth && openAuth('login')} className="px-3 py-1 border rounded-md text-sm">Login</button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-between"
            >
              {submitted ? (
                <div className="text-center py-8">
                  <p className="font-semibold text-lg text-slate-900">Thanks — your message has been sent!</p>
                  <p className="text-sm text-slate-600 mt-2">We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div>
                        <label className="block mb-2 font-semibold text-[#0C2E50] text-sm sm:text-base">
                          Full Name
                        </label>
                        <input
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your name"
                          className="mt-1 w-full bg-slate-100/80 px-4 py-3 rounded-md focus:outline-none text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-semibold text-[#0C2E50] text-sm sm:text-base">
                          Email
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="Enter your email"
                          className="mt-1 w-full bg-slate-100/80 px-4 py-3 rounded-md focus:outline-none text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-[#0C2E50] text-sm sm:text-base">
                        Subject
                      </label>
                      <input
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        placeholder="Enter Subject"
                        className="w-full bg-slate-100 px-4 py-3 rounded-md focus:outline-none text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-[#0C2E50] text-sm sm:text-base">
                        Your Message
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Write message here..."
                        className="w-full bg-slate-100 px-4 py-3 rounded-md resize-none focus:outline-none text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex justify-center  mt-8 sm:mt-10">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-3 bg-[#0C2E50] text-white px-6 sm:px-8 py-3 rounded-lg hover:opacity-90 text-sm sm:text-base cursor-pointer"
                    >
                      {submitting ? 'Sending...' : (
                        <>
                          <span>Send</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
