import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic imports below (not static top-level imports) - see scripts/seed.ts
// for why: several modules read process.env at import time via lib/db.

// npm run db:seed:events

const eventImageUrl = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

const PAST_EVENTS = [
  {
    title: "Annual Sports Day",
    eventDate: "2026-03-14T09:00:00.000Z",
    venue: "School Field",
    description:
      "Our Annual Sports Day brought together students, teachers, and families for a full day of athletics, team competitions, and friendly rivalry between houses. From the 100m sprint to the tug-of-war finale, the energy on the field was unmatched. Younger pupils took part in sack races and relay handoffs while senior classes competed in track events judged by visiting coaches. Parents cheered from the sidelines, and the PTA ran a refreshments stall that funded new sports equipment. A huge thank you to every parent and volunteer who helped make the day run smoothly from start to finish.",
  },
  {
    title: "Cultural Week Gala",
    eventDate: "2026-04-22T13:00:00.000Z",
    venue: "Main Hall",
    description:
      "Cultural Week closed with a gala evening celebrating the many communities represented across our student body. Classes presented traditional dances, songs, and short skits researched and rehearsed over the preceding weeks, and the hall was decorated with artwork and flags made by pupils in art class. A rotating food table let families sample dishes contributed by parent volunteers, and the evening ended with a joint performance from the school choir and drumming ensemble. Teachers reported that the preparation itself, not just the final show, gave students a genuine appreciation for traditions outside their own homes.",
  },
  {
    title: "Founders Day Assembly",
    eventDate: "2026-05-08T08:30:00.000Z",
    venue: "School Amphitheatre",
    description:
      "Founders Day marked another year since the school first opened its doors, and this year's assembly leaned into that history. Former headteachers and long-serving staff were invited to share memories of the school's early years, contrasted with a slideshow of how the campus has grown since. Senior students unveiled a time capsule to be reopened at the next major anniversary, containing letters written by this year's graduating class to their future selves. The assembly closed with the whole school singing the school anthem together, a tradition that dates back to the very first Founders Day.",
  },
  {
    title: "Term 2 Prize Giving",
    eventDate: "2026-06-19T10:00:00.000Z",
    venue: "Main Hall",
    description:
      "The Term 2 Prize Giving ceremony recognised outstanding academic performance, sporting achievement, and contributions to school life across every grade. Parents packed the main hall as class teachers called forward top performers in each subject, and a new peer-nominated Kindness Award was introduced this term, voted on by students themselves. The Director of Studies gave a short address on the value of consistent effort over raw talent, echoing a theme many teachers had been reinforcing in class all term. Certificates, medals, and a handful of book vouchers were handed out before the hall emptied for a closing tea reception.",
  },
];

const UPCOMING_EVENTS = [
  {
    title: "Inter-House Debate Finals",
    eventDate: "2026-09-11T14:00:00.000Z",
    venue: "Main Hall",
    description:
      "The Inter-House Debate Finals bring together the top two teams from a term of preliminary rounds to argue the motion in front of the whole senior school. This year's final topic, chosen by the debate club committee, touches on the use of technology in the classroom, and both finalist teams have been preparing rebuttals for weeks under the guidance of the English department. Judging will be handled by a panel of three, including an alumna who competed in the same competition a decade ago. Refreshments will be available from 1:30pm, and parents of finalists are especially encouraged to attend and support their students.",
  },
  {
    title: "Career Guidance Day",
    eventDate: "2026-09-25T09:00:00.000Z",
    venue: "School Grounds",
    description:
      "Career Guidance Day invites professionals from a wide range of fields to spend the morning speaking with senior students about their career paths, day-to-day work, and the choices that shaped their journeys. This year's lineup includes a civil engineer, a nurse, a software developer, and a small-business owner, each running a short workshop followed by open Q&A. Students will rotate through three sessions of their choosing and leave with a short reflection worksheet to discuss with their form teacher afterward. The goal is not to hand out answers but to widen the range of paths students feel are realistically open to them.",
  },
  {
    title: "Annual Music Festival",
    eventDate: "2026-10-09T15:30:00.000Z",
    venue: "School Amphitheatre",
    description:
      "The Annual Music Festival showcases everything the music department has been building toward all year, from the junior recorder ensemble to the senior choir and the newly formed guitar club. Each group performs a short set, and this year's programme closes with a combined piece involving every performing group on stage at once, arranged specially by the music teacher for the occasion. Tickets are free, but families are asked to reserve seats in advance given limited seating in the amphitheatre. Proceeds from the festival's snack stall go directly toward replacing ageing instruments in the music room.",
  },
  {
    title: "Parents Open Day",
    eventDate: "2026-10-23T08:00:00.000Z",
    venue: "Whole Campus",
    description:
      "Parents Open Day gives families a chance to walk through a normal school day alongside their children, sitting in on real lessons rather than staged demonstrations. Classrooms will run their usual timetable, with a few teachers setting aside short segments for parents to ask questions or see recent project work firsthand. The library and science labs will also host drop-in stations where visiting parents can try activities students have been working on this term. The day wraps up with light refreshments in the courtyard and an informal chance to meet other families and staff.",
  },
  {
    title: "End of Term Concert",
    eventDate: "2026-11-13T17:00:00.000Z",
    venue: "Main Hall",
    description:
      "The End of Term Concert is a relaxed, family-friendly evening marking the close of Term 3, featuring performances from drama club, the junior orchestra, and a handful of student-written comedy sketches. Unlike the more formal Annual Music Festival, this concert leans casual, with classes free to propose acts through their form teacher earlier in the term. A slideshow of photos from the year's events will play during the interval, put together by the yearbook committee. The evening closes with a short address from the head teacher looking ahead to the new academic year, followed by refreshments for all attending families.",
  },
];

async function main() {
  const { db } = await import("../lib/db");
  const { events, profiles } = await import("../lib/db/schema");
  const { eventSchema } = await import("../lib/db/types/events.types");
  const { sql } = await import("drizzle-orm");
  const slugify = (await import("slugify")).default;

  const [author] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(sql`'secretary' = any(${profiles.roles})`)
    .limit(1);

  if (!author) {
    throw new Error(
      "No secretary profile found to attribute seeded events to — run `npm run db:seed` first.",
    );
  }

  const allEvents = [...PAST_EVENTS, ...UPCOMING_EVENTS].map((e, i) => {
    const parsed = eventSchema.parse({
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      venue: e.venue,
      imageUrls: [eventImageUrl(`event-${i + 1}`), eventImageUrl(`event-${i + 1}-b`)],
    });
    return {
      ...parsed,
      slug: slugify(parsed.title, { lower: true }),
      authorId: author.id,
    };
  });

  console.log(`Seeding ${PAST_EVENTS.length} past and ${UPCOMING_EVENTS.length} upcoming events...`);

  const inserted = await db.insert(events).values(allEvents).returning();

  console.log(`\nSeed complete: ${inserted.length} events inserted.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
