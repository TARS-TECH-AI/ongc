import React from "react";
import { Youtube, Send, Linkedin, Facebook } from "lucide-react";
import Logo from "../assets/Logo.png";

const Footer = ({ onOpenAuth, isAuthenticated }) => {
  const handleClick = (id, restricted) => {
    if (restricted && !isAuthenticated) return onOpenAuth && onOpenAuth('login');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="w-full bg-white font-[Poppins]">

      {/* Top horizontal line with margin */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-slate-400"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Logo + About */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-5">
              <img
                src={Logo}
                alt="AISCS&STEWA Logo"
                className="w-24 h-24 object-contain"
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  AISCSTEWA – CWC
                </h3>
                <p className="text-base font-medium text-slate-900 mt-1">
                  All India SC & ST Employees Welfare Association
                </p>
              </div>
            </div>

            <p className="text-base text-slate-700 leading-relaxed max-w-xl">
              Committed to safeguarding the constitutional rights and promoting
              the welfare of Scheduled Caste and Scheduled Tribe employees across
              all ONGC establishments.
            </p>

            {/* Social Icons (LUCIDE) */}
            <div className="flex gap-4 pt-3">
              {[
                { Icon: Youtube, label: "YouTube" },
                { Icon: Send, label: "Telegram" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Facebook, label: "Facebook" },
              ].map(({ Icon, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-black text-black hover:bg-black hover:text-white transition"
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-4 text-slate-700">
              <li onClick={() => handleClick('home')} className="hover:text-orange-500 cursor-pointer">Home</li>
              <li onClick={() => handleClick('about')} className="hover:text-orange-500 cursor-pointer">About</li>
              <li onClick={() => handleClick('members')} className="hover:text-orange-500 cursor-pointer">Members</li>
              <li onClick={() => handleClick('documents', true)} className="hover:text-orange-500 cursor-pointer">Official Documents</li>
            </ul>
          </div>

          {/* Units */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-3">
              AISCSTEWA Units
            </h4>
            <ul className="space-y-4 text-slate-700">
              <li onClick={() => handleClick('updates', true)} className="hover:text-orange-500 cursor-pointer">Important Updates</li>
              <li onClick={() => handleClick('gallery')} className="hover:text-orange-500 cursor-pointer">Photo Gallery</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-3">
              Contact
            </h4>
            <p className="text-slate-700 leading-relaxed">
              <a
                href="tel:+911123456789"
                className="block hover:underline"
              >
                +91-1352792624
              </a>
              <br/>
              Deendayal Urja Bhavan ,5 Nelson Mandela Road,
            <br />
           Vasant Kunj,<br/>
             New Delhi -11007
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 text-slate-900 ">
          © 2025 Oil and Natural Gas Corporation Limited. All rights reserved.
        </div>
        
        {/* Horizontal line */}
        <div className="mt-8 border-t border-slate-300"></div>
          
        <div className="mt-6 text-slate-500 justify-center text-center text-sm">
          <a 
            href="https://tarstech.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-700 cursor-pointer transition"
          >
            © copyright 2025 Design and Developed with love by TARS TECHNOLOGIES
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
