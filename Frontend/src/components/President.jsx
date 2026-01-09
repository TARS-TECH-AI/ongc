import React from "react";
import presidentImg from "../assets/President.jpeg";
import secretaryImg from "../assets/Secretery.jpeg";
import coordinatorImg from "../assets/coordinator.jpeg";

// Members Data
const defaultMembers = [
  {
    role: "President-CWC",
    name: "Mr. Vipin Kumar Bhartiya",
    image: presidentImg,
    thought: "Lead with integrity and serve the community.",
  },
  {
    role: "Gen Secretary-CWC",
    name: "Mr. S. Gangatharan",
    image: secretaryImg,
    thought: "Organise with care, communicate with clarity.",
  },
  {
    role: "Coordinator of the Social Media & Website Development Committee And Working President-CWC",
    name: "Mr. Dembi Ram Panging",
    image: coordinatorImg,
    thought:
      "We feel immensely proud to be ONGCians and committed members of AISCSTEWA, ONGC. Our dedication has always been towards the welfare of our members and the upliftment of our society. In today’s evolving environment, it is essential to transform our activities from traditional modes to transparent and technology-driven platforms. To ensure that our general members have a clear understanding of the Association’s initiatives and to strengthen communication across all levels, the development of a dedicated website has become a vital necessity. As entrusted by our respected President, CWC, this website has been successfully developed. I extend my sincere gratitude to him for giving me the opportunity to lead and coordinate this important task. My heartfelt thanks to all esteemed members of the Social Media and Website Design Committee for their continuous support, valuable suggestions, and teamwork throughout this journey.I look forward to your continued cooperation and active involvement in the future as we work together for the growth and transparency of our Jai Bhim..",
  },
];

// Helper: format thought into paragraphs
const formatThought = (text) => {
  if (!text) return [];
  // split on explicit double newlines first
  const byParagraph = text.split(/\n\s*\n/).filter(Boolean);
  if (byParagraph.length > 1) return byParagraph.map(p => p.trim());

  // otherwise split into sentences and group ~3 sentences per paragraph
  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text]).map(s => s.trim());
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' '));
  }
  return paragraphs;
};

// Member Card (stacked card layout)
const MemberCard = ({ member, bg }) => (
  <div className="w-full">
    <div
      className={`flex items-center gap-6 ${bg} rounded-2xl p-4 sm:p-6 shadow-sm w-full`}
    >
      {/* Image */}
      <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden bg-slate-100 ring-2 ring-amber-200 flex-shrink-0">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <div className="flex-1 text-left">
        <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">
          {member.name}
        </p>
        <p className="text-sm sm:text-base md:text-lg font-semibold text-[#0C2E50] whitespace-pre-line">
          {member.role}
        </p>
        <div className="mt-3 text-sm sm:text-base text-slate-700 text-justify">
          {formatThought(member.thought).map((para, i) => (
            <p key={i} className="mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  </div>
);
// Main Component
const President = ({ members = defaultMembers }) => {
  return (
    <section className="py-4">
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Message From -
        </h2>
        <div className="w-20 sm:w-28 h-1 bg-orange-500 mx-auto mt-3"></div>
      
        <div className="flex flex-col gap-6">
          {(() => {
            const cardColors = [
              "bg-yellow-50",
              "bg-amber-50",
              "bg-emerald-50",
              "bg-sky-50",
              "bg-pink-50",
            ];
            return members.map((member, index) => {
              const bg = cardColors[index % cardColors.length];
              return <MemberCard key={index} member={member} bg={bg} />;
            });
          })()}
        </div>
      </div>
    </section>
  );
};

export default President;
