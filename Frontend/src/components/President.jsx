import React from 'react';

const defaultMembers = [
  {
    role: 'President-CWC',
    name: 'Mr. Vipin Kumar Bhartiya',
    image: '/src/assets/president.jpeg',
    thought: 'Lead with integrity and serve the community with dedication.'
  },
  {
    role: 'Gen Secretary-CWC',
    name: 'Mr. S. Gangatharan',
    image: '/src/assets/Secretery.jpeg',
    thought: 'Organise with care, communicate with clarity.'
  },
  {
    role: 'Coordinator Of the Social Media & Website Development Committee',
    name: 'Mr. Dembi Ram Panging',
    image: '/src/assets/coordinator.jpeg',
    thought: 'Coordinate efforts to turn ideas into impact.'
  }
];

const MemberCard = ({ member }) => (
  <div className="flex flex-col items-center text-center p-4 w-full">
    <div className="
      w-28 h-28
      sm:w-32 sm:h-32
      md:w-44 md:h-44
      lg:w-52 lg:h-52
      rounded-full overflow-hidden bg-slate-100
      shadow-lg ring-2 ring-slate-200
    ">
      <img
        src={member.image}
        alt={`${member.role} ${member.name}`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/300';
        }}
      />
    </div>

    <div className="mt-4 px-2">
      <div className="text-xs sm:text-sm md:text-base text-slate-500">
        {member.role}
      </div>
      <div className="font-semibold text-slate-900 text-base sm:text-lg md:text-xl">
        {member.name}
      </div>
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
        {member.thought}
      </p>
    </div>
  </div>
);

const President = ({ members = defaultMembers }) => {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-8
            place-items-center
          "
        >
          {members.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default President;
