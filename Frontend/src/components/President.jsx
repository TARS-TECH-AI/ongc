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
    thought: `Dear Members, Colleagues, and Visitors,
It gives me immense pride and honour to welcome you to the official website of our Association. This online space represents us not just as an association, but a collective commitment to empowerment, inclusion, and social responsibility towards our members, organization and society.

Tribute to Great Leaders
At the outset, I pay my heartfelt tribute to the great visionaries and social reformers whose thoughts and struggles continue to guide our path—Bharat Ratna Dr. B. R. Ambedkar (Babasaheb), Mahatma Jyotiba Phule, Gautam Buddha, Chhatrapati Shahu Ji Maharaj, Periyar E. V. Ramasamy , Bhagwan Birsa Munda , Jananeta Bhimbor Deori and many more who sacrificed their lives for making ours better. Their unwavering commitment to social justice, equality, education, and human dignity inspires us to work tirelessly for an inclusive society.

We reaffirm our commitment to uphold and carry forward their legacy by promoting Equity, Fraternity, Social Awareness about education, self-respect, and collective progress among our communities. We cherish the vast diversity of cultural, linguistic and social heritage from our 22 units across the county and share common brotherhood among thousands of proud members.

Our association stands firmly rooted in the constitutional values of justice, liberty, equality, and fraternity as enshrined in the Constitution of India. In particular, we draw guidance from the following constitutional provisions:
   • Article 14 – Ensuring equality before the law and equal protection of laws
   • Article 15(4) & 15(5) – Enabling special provisions for the advancement of socially and educationally backward classes, including SC/ST communities
   • Article 16(4) & 16(4A) – Providing for reservation in appointments and promotions in favor of SC/ST employees
   • Article 21 – Right to life with dignity.
   • Article 46 – Promotion of educational and economic interests of Scheduled Castes and Scheduled Tribes and protection from social injustice and exploitation

These provisions form the legal and moral foundation of our mission and guide our efforts toward equity and empowerment under the ambit of Society Act 1860.

Our Association draws inspiration from the foundational principles and mission-driven approach of Public Sector Undertakings (PSUs) also, which have long stood as pillars of nation-building. Their vision of sustainable growth, public welfare, and equitable opportunity continues to guide our journey.

We are equally inspired by the mission and vision of ONGC, which emphasize excellence, integrity, innovation, and inclusive development. These values resonate deeply with our purpose and strengthen our resolve to contribute meaningfully to both our members and society at large.

Our Mission
To safeguard the constitutional rights and service interests of SC/ST employees, promote equal opportunity in professional growth, and foster a culture of dignity, inclusiveness, and empowerment within the organization.

Our Vision
To build a progressive, equitable, and supportive institutional environment where every SC/ST employee can achieve their full potential and contribute meaningfully to organizational and national development.

Pay Back to Society – Our Commitment
In alignment with the constitutional spirit of social justice, our Association is committed to giving back to society. We actively promote:
• Educational support and mentorship for underprivileged.
• Promoting Vendors Participation and Development Programs.
• Community development programs focused on empowerment and inclusion through CSR initiatives.

We believe that true progress lies not only in personal and professional advancement but also in uplifting those who are marginalized and underserved.

Together, let us continue to uphold our shared values, strengthen our unity, and work tirelessly towards progress—for our members, our organization, and the society we serve.

As we move forward, let us remain united in our purpose, guided by constitutional values, and committed to building a just, inclusive, and progressive society.

I invite all members and stakeholders to actively engage with our initiatives and contribute to this shared vision.

Truly Yours
Vipin Kumar ‘Bharatiya’
President CWC 
AISCSTEWA ONGC Ltd.`
  },
  {
    role: "Gen Secretary-CWC",
    name: "Mr. S. Gangatharan",
    image: secretaryImg,
    thought: `It is both an honour and a privilege to address all members of the AISCSTEWA family through this platform.

       Our Association has always stood as a beacon of unity, equality, and empowerment, steadfast in its commitment to the welfare and advancement of SC/ST employees. With unwavering determination, we continue to uphold the principles of justice, inclusivity, and collective progress. As the saying goes, “unity is strength,” and it is this very spirit that has enabled us to overcome challenges and move forward with confidence.

       At AISCSTEWA, we firmly believe that “where there is a will, there is a way.” Our journey has been marked by consistent efforts to safeguard the rights, dignity, and opportunities of our members. We strive to act as a bridge between employees and management, ensuring that every voice is heard and every concern is addressed with fairness and transparency.

       In today’s dynamic and evolving environment, it is essential that we stay informed, united, and proactive. Let us continue to “leave no stone unturned” in our pursuit of equality, professional growth, and organizational excellence. Together, we can build a stronger, more inclusive future for all.
       I sincerely appreciate the dedication, cooperation, and trust extended by our members, office bearers, and well-wishers. Your continued support is the cornerstone of our success.

       Let us move forward with renewed energy and collective resolve to achieve greater milestones in the days ahead.
    
    With warm regards,
    (S. Gangatharan)
   General Secretary (CWC)
   AISCSTEWA ONGC LTD.
`
  },
  {
    role: "Coordinator of the Social Media & Website Development Committee And Working President-CWC",
    name: "Mr. Dembi Ram Panging",
    image: coordinatorImg,
    thought:
      `We feel immensely proud to be Ongcians and committed members of AISCSTEWA, ONGC. Our dedication has always been towards the welfare of our members and the upliftment of our society. In today’s evolving environment, it is essential to transform our activities from traditional modes to transparent and technology-driven platforms. To ensure that our general members have a clear understanding of the Association’s initiatives and to strengthen communication across all levels, the development of a dedicated website has become a vital necessity. As entrusted by our respected President, CWC, this website has been successfully developed. I extend my sincere gratitude to him for giving me the opportunity to lead and coordinate this important task. My heartfelt thanks to all esteemed members of the Social Media and Website Design Committee for their continuous support, valuable suggestions, and teamwork throughout this journey.I look forward to your continued cooperation and active involvement in the future as we work together for the growth and transparency of our                               
     Jai Bhim..`,
  },
];

// Helper: format thought into paragraphs
const formatThought = (text) => {
  if (!text) return [];
  // split on explicit double newlines first
  const byParagraph = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (byParagraph.length > 1) return byParagraph;

  // fallback: split by sentence boundaries, including final fragment
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!sentences.length) return [text.trim()];

  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' '));
  }

  return paragraphs;
};

// Member Card (stacked card layout)
const MemberCard = ({ member, bg }) => {
  const paragraphs = formatThought(member.thought);
  const [expanded, setExpanded] = React.useState(false);
  const fullThought = member.thought?.trim() || '';
  const hasOverflow = fullThought.length > 240;

  const truncateThought = (text, maxChars = 300) => {
    if (text.length <= maxChars) return text;
    const trimmed = text.slice(0, maxChars).trim();
    return trimmed.replace(/\s+$/, '') + '...';
  };

  return (
    <div className="w-full">
      <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 ${bg} rounded-2xl p-4 sm:p-6 shadow-sm w-full`}>
        {/* Image */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden bg-slate-100 ring-2 ring-amber-200 flex-shrink-0 flex items-center justify-center mb-4 sm:mb-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex-1 text-left">
          <p className="mt-1 text-base sm:text-lg font-bold text-slate-900 text-center sm:text-left">
            {member.name}
          </p>
          <p className="text-sm sm:text-base md:text-lg font-semibold text-[#0C2E50] whitespace-pre-line text-center sm:text-left">
            {member.role}
          </p>
          <div className="mt-3 text-sm sm:text-base text-slate-700 text-justify">
            {!expanded ? (
              <div className="mb-0 whitespace-pre-line">
                {paragraphs.slice(0, 2).join('\n\n')}
              </div>
            ) : (
              <div>
                {paragraphs.map((para, i) => {
                  const trimmed = para.trim();
                  const lines = trimmed.split(/\n+/).map((line) => line.trim()).filter(Boolean);

                  const isList = lines.every((line) => /^([•\-*]|\u2022)\s*/.test(line));
                  if (isList) {
                    return (
                      <ul key={i} className="mb-3 list-disc list-inside">
                        {lines.map((line, idx) => (
                          <li key={idx} className="text-sm sm:text-base text-slate-700">
                            {line.replace(/^([•\-*]|\u2022)\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <div key={i} className="mb-3 last:mb-0">
                      {lines.map((line, lineIdx) => {
                        const isHeadline = /^(Tribute to Great Leaders|Our Mission|Our Vision|Pay Back to Society|Truly Yours|With warm regards|Regards)$/i.test(line)
                          || /with\s*warm\s*regards|jai\s*bhim/i.test(line);
                        return isHeadline ? (
                          <p key={lineIdx} className="mb-1 font-bold text-[#0C2E50]">
                            {line}
                          </p>
                        ) : (
                          <p key={lineIdx} className="mb-1 whitespace-pre-line text-slate-700">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {hasOverflow && (
              <button
                onClick={() => setExpanded((s) => !s)}
                className="mt-2 text-sm text-[#0C2E50] font-semibold cursor-pointer"
              >
                {expanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// Main Component
const President = ({ members = defaultMembers }) => {
  return (
    <section className="py-4">
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Message From 
           <span className="block h-1 w-16 bg-orange-400 mx-auto mt-3 rounded"></span>
        </h2>
        
      
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
