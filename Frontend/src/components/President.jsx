import React from 'react';
import presidentImg from '../assets/President.jpeg';
import secretaryImg from '../assets/Secretery.jpeg';
import coordinatorImg from '../assets/coordinator.jpeg';

// Members Data
const defaultMembers = [
  {
    role: 'President-CWC',
    name: 'Mr. Vipin Kumar Bhartiya',
    image: presidentImg,
    thought: 'Lead with integrity and serve the community.'
  },
  {
    role: 'Gen Secretary-CWC',
    name: 'Mr. S. Gangatharan',
    image: secretaryImg,
    thought: 'Organise with care, communicate with clarity.'
  },
  {
    role: 'Coordinator of the Social Media & Website Development Committee And Working President-CWC',
    name: 'Mr. Dembi Ram Panging',
    image: coordinatorImg,
    thought: 'Coordinate efforts to turn ideas into impact.'
  }
];

// Member Card
const MemberCard = ({ member }) => (
  <div className="flex flex-col items-center text-center p-1 w-full sm:w-auto max-w-[274]">
    {/* Image */}
    <div
      className="
        w-28 h-28
        sm:w-36 sm:h-36
        md:w-44 md:h-44
        lg:w-56 lg:h-56
        rounded-full overflow-hidden
        bg-slate-100 shadow ring-1 ring-slate-200
      "
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Text */}
    <p className="mt-1 text-xl sm:text-sm text-slate-500 leading-tight">
      {member.role}
    </p>

    <p className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 leading-tight">
      {member.name}
    </p>

    {/* Hide thought on mobile */}
    <p className="hidden sm:block text-sm text-slate-600 mt-1">
      {member.thought}
    </p>
  </div>
);

// Main Component
const President = ({ members = defaultMembers }) => {
  return (
    <section className="py-4">
      <div className="max-w-7xl mx-auto px-2">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-3
            gap-1
            sm:gap-2
            md:gap-3
          "
        >
          {members.map((member, index) => (
            <div
              key={index}
              className="flex justify-center"
            >
              <MemberCard member={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default President;
