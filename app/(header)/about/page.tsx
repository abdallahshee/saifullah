import Image from "next/image";

// Placeholder data — replace with real content, or fetch from a
// school-settings server method once one exists.
const SCHOOL_INFO = {
  name: "Saifullah Integrated Academy",
  heroImageUrl: "https://loremflickr.com/1600/700/gate,entrance,school?lock=4",
  establishedYear: 1998,
  about:
    "Saifullah Integrated Academy has served the local community for over two decades, growing from a single classroom into a full primary and secondary institution. We believe every child deserves an environment where curiosity is encouraged, character is built, and no student is left behind.",
  mission:
    "To provide a nurturing, disciplined, and academically rigorous environment where every learner is equipped with the knowledge, skills, and values to thrive beyond the classroom.",
  vision:
    "To be a leading center of academic excellence and character formation, recognized for producing confident, principled, and capable young people.",
  motto: "Knowledge. Character. Excellence.",
};

const HEADTEACHER = {
  firstName: "Grace",
  lastName: "Mwangi",
  photoUrl: "https://picsum.photos/seed/headteacher/400/400",
  message:
    "Every child who walks through our gates carries a story still being written. Our role is to make sure that story is shaped by curiosity, kindness, and the belief that they can achieve anything they set their minds to. Thank you for trusting us with that responsibility.",
};

const TEAM = [
  {
    id: "1",
    firstName: "Peter",
    lastName: "Otieno",
    role: "Deputy Head Teacher",
    photoUrl: "https://picsum.photos/seed/team1/300/300",
    message: "Discipline and encouragement, in equal measure, is how we help every child grow.",
  },
  {
    id: "2",
    firstName: "Amina",
    lastName: "Hassan",
    role: "Director of Studies",
    photoUrl: "https://picsum.photos/seed/team2/300/300",
    message: "Our curriculum is built around one question: will this help a child think for themselves?",
  },
  {
    id: "3",
    firstName: "Samuel",
    lastName: "Kariuki",
    role: "Head of Pastoral Care",
    photoUrl: "https://picsum.photos/seed/team3/300/300",
    message: "A child who feels safe and seen is a child who's ready to learn.",
  },
  {
    id: "4",
    firstName: "Faith",
    lastName: "Njeri",
    role: "Head of Admissions",
    photoUrl: "https://picsum.photos/seed/team4/300/300",
    message: "I look forward to welcoming your family and answering every question you have.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Hero image */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        <Image
          src={SCHOOL_INFO.heroImageUrl}
          alt={SCHOOL_INFO.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 sm:px-12">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--brand-gold)]">
            ESTABLISHED {SCHOOL_INFO.establishedYear}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">
            About {SCHOOL_INFO.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-16 sm:px-12">
        {/* About */}
        <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
          OUR STORY
        </p>
        <p className="mt-3 text-balance text-lg font-medium leading-relaxed text-[var(--ink)]">
          {SCHOOL_INFO.about}
        </p>

        {/* Mission / Vision / Motto */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <InfoCard title="Our mission" body={SCHOOL_INFO.mission} />
          <InfoCard title="Our vision" body={SCHOOL_INFO.vision} />
          <InfoCard title="Our motto" body={SCHOOL_INFO.motto} emphasize />
        </div>

        {/* Headteacher */}
        <div className="mt-20 rounded-2xl border border-[var(--line)] bg-white px-8 py-12 sm:px-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-[var(--paper)] shadow-md">
              <Image
                src={HEADTEACHER.photoUrl}
                alt={`${HEADTEACHER.firstName} ${HEADTEACHER.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-balance font-serif text-xl italic leading-relaxed text-[var(--ink)]">
              &ldquo;{HEADTEACHER.message}&rdquo;
            </p>
            <div>
              <p className="font-serif text-lg text-[var(--ink)]">
                {HEADTEACHER.firstName} {HEADTEACHER.lastName}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--slate)]">
                Head Teacher
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mt-20">
          <p className="font-mono text-xs tracking-[0.2em] text-[var(--slate)]">
            OUR TEAM
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--ink)]">
            The people behind {SCHOOL_INFO.name}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TEAM.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  body,
  emphasize,
}: {
  title: string;
  body: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--line)] p-5 ${
        emphasize ? "bg-[var(--brand-navy)]" : "bg-white"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-wide ${
          emphasize ? "text-[var(--brand-gold)]" : "text-[var(--slate)]"
        }`}
      >
        {title}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          emphasize ? "font-serif text-lg text-white" : "text-[var(--ink)]"
        }`}
      >
        {body}
      </p>
    </div>
  );
}

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-[var(--line)] bg-white p-5">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
        <Image
          src={member.photoUrl}
          alt={`${member.firstName} ${member.lastName}`}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--ink)]">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-[var(--slate)]">{member.role}</p>
        <p className="mt-2 text-sm italic leading-relaxed text-[var(--ink)]">
          &ldquo;{member.message}&rdquo;
        </p>
      </div>
    </div>
  );
}
