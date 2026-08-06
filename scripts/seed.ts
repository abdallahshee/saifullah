import { config } from "dotenv";
config({ path: ".env.local" });

// Dynamic imports below (not static top-level imports) because several of
// these modules read process.env at import time (via lib/db) - a static
// import would get hoisted ahead of the config() call above by tsx's CJS
// transform and see DATABASE_URL/SUPABASE_SERVICE_ROLE_KEY as unset. See
// scripts/seed-admin.ts for the same pattern.

// npm run db:seed

// Deterministic placeholder images (same seed always resolves to the same
// image) so re-running the seed script produces stable, non-broken URLs for
// the new profile_url / class_url columns.
const avatarUrl = (seed: string) =>
  `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;
const classPhotoUrl = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`;

async function main() {
  const { admitStaffMember } = await import("../lib/auth/admit-staff");
  const { db } = await import("../lib/db");
  const {
    classes,
    students,
    studentGuardians,
    terms,
    classTermFees,
    feeRecords,
    feePayments,
    attendanceRecords,
    academicReports,
  } = await import("../lib/db/schema");

  console.log("Admitting staff (secretary + 8 teachers)...");

  const { userId: secretaryId } = await admitStaffMember(
    {
      firstName: "Amina",
      lastName: "Wanjiru",
      email: "secretary@seed.school.test",
      phone: "+254700000001",
      profileUrl: avatarUrl("secretary@seed.school.test"),
    },
    "secretary",
  );

  const teacherSeeds = [
    { firstName: "Grace", lastName: "Mwangi" },
    { firstName: "Peter", lastName: "Otieno" },
    { firstName: "Faith", lastName: "Kamau" },
    { firstName: "Brian", lastName: "Odhiambo" },
    { firstName: "Lucy", lastName: "Njeri" },
    { firstName: "Samuel", lastName: "Kiprop" },
    { firstName: "Mercy", lastName: "Achieng" },
    { firstName: "David", lastName: "Mutua" },
  ];

  const teacherIds: string[] = [];
  for (const [i, t] of teacherSeeds.entries()) {
    const email = `teacher${i + 1}@seed.school.test`;
    const { userId } = await admitStaffMember(
      {
        firstName: t.firstName,
        lastName: t.lastName,
        email,
        phone: `+2547000001${String(i + 1).padStart(2, "0")}`,
        profileUrl: avatarUrl(email),
      },
      "teacher",
    );
    teacherIds.push(userId);
  }

  console.log("Admitting 8 parents...");

  const parentSeeds = [
    { firstName: "Joyce", lastName: "Chebet" },
    { firstName: "Michael", lastName: "Omondi" },
    { firstName: "Susan", lastName: "Wambui" },
    { firstName: "Daniel", lastName: "Kiplagat" },
    { firstName: "Esther", lastName: "Auma" },
    { firstName: "James", lastName: "Mwaura" },
    { firstName: "Rose", lastName: "Nafula" },
    { firstName: "Kevin", lastName: "Barasa" },
  ];

  const parentIds: string[] = [];
  for (const [i, p] of parentSeeds.entries()) {
    const email = `parent${i + 1}@seed.school.test`;
    const { userId } = await admitStaffMember(
      {
        firstName: p.firstName,
        lastName: p.lastName,
        email,
        phone: `+2547000002${String(i + 1).padStart(2, "0")}`,
        profileUrl: avatarUrl(email),
      },
      "parent",
    );
    parentIds.push(userId);
  }

  console.log("Creating 8 classes...");

  const classNames = [
    "Grade 1A",
    "Grade 1B",
    "Grade 2A",
    "Grade 2B",
    "Grade 3A",
    "Grade 3B",
    "Grade 4A",
    "Grade 4B",
  ];

  const insertedClasses = await db
    .insert(classes)
    .values(
      classNames.map((name, i) => ({
        name,
        teacherId: teacherIds[i],
        classUrl: classPhotoUrl(name),
      })),
    )
    .returning();

  console.log("Creating terms (2024-2026, 3 terms each)...");

  const termDefs = [2024, 2025, 2026].flatMap((year) => [
    { year, name: "Term 1" as const, startDate: `${year}-01-06`, endDate: `${year}-04-04` },
    { year, name: "Term 2" as const, startDate: `${year}-05-04`, endDate: `${year}-08-01` },
    { year, name: "Term 3" as const, startDate: `${year}-09-01`, endDate: `${year}-11-28` },
  ]);

  const insertedTerms = await db.insert(terms).values(termDefs).returning();

  // The "current" term seeded data (fee records, attendance, reports) hangs
  // off of - Term 2, 2026 covers today's date (2026-08-06).
  const currentTerm = insertedTerms.find(
    (t) => t.year === 2026 && t.name === "Term 2",
  )!;

  console.log("Creating class_term_fees for the current term (8 classes)...");

  const insertedClassTermFees = await db
    .insert(classTermFees)
    .values(
      insertedClasses.map((c, i) => ({
        termId: currentTerm.id,
        classId: c.id,
        amount: String(15000 + i * 500),
      })),
    )
    .returning();

  console.log("Admitting 8 students...");

  const studentSeeds = [
    { firstName: "Alice", lastName: "Njoroge", dob: "2016-03-12" },
    { firstName: "Brian", lastName: "Kimani", dob: "2016-07-22" },
    { firstName: "Cynthia", lastName: "Atieno", dob: "2015-11-02" },
    { firstName: "Dennis", lastName: "Rotich", dob: "2015-05-18" },
    { firstName: "Eunice", lastName: "Wafula", dob: "2014-09-09" },
    { firstName: "Felix", lastName: "Mbugua", dob: "2014-01-27" },
    { firstName: "Grace", lastName: "Chepkoech", dob: "2013-06-14" },
    { firstName: "Hassan", lastName: "Abdi", dob: "2013-12-30" },
  ];

  const insertedStudents = await db
    .insert(students)
    .values(
      studentSeeds.map((s, i) => ({
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: s.dob,
        classId: insertedClasses[i].id,
        admittedBy: secretaryId,
        profileUrl: avatarUrl(`${s.firstName}.${s.lastName}@seed.school.test`),
      })),
    )
    .returning();

  console.log("Linking students to guardians...");

  const relationships = ["Mother", "Father", "Guardian"];
  const guardianRows = insertedStudents.flatMap((student, i) => {
    const rows = [
      {
        studentId: student.id,
        parentId: parentIds[i],
        relationship: relationships[i % relationships.length],
      },
    ];
    // Give the first half of students a second guardian too, to exercise
    // the many-to-many relationship (capped at 2 per student).
    if (i < 4) {
      rows.push({
        studentId: student.id,
        parentId: parentIds[(i + 1) % parentIds.length],
        relationship: relationships[(i + 1) % relationships.length],
      });
    }
    return rows;
  });

  await db.insert(studentGuardians).values(guardianRows);

  console.log("Creating fee records for the current term (8 students)...");

  const insertedFeeRecords = await db
    .insert(feeRecords)
    .values(
      insertedStudents.map((student, i) => ({
        studentId: student.id,
        termId: currentTerm.id,
        classId: insertedClasses[i].id,
        createdBy: secretaryId,
      })),
    )
    .returning();

  console.log("Recording fee payments (M-Pesa installments)...");

  const paymentRows = insertedFeeRecords.flatMap((record, i) => {
    const amountExpected = Number(insertedClassTermFees[i].amount);
    const rows = [
      {
        feeRecordId: record.id,
        amount: String(Math.round(amountExpected * 0.6)),
        mpesaTransactionReference: `SEED-MPESA-${i + 1}-A`,
        recordedBy: secretaryId,
      },
    ];
    // A few students pay in two installments instead of one lump sum.
    if (i < 3) {
      rows.push({
        feeRecordId: record.id,
        amount: String(Math.round(amountExpected * 0.4)),
        mpesaTransactionReference: `SEED-MPESA-${i + 1}-B`,
        recordedBy: secretaryId,
      });
    }
    return rows;
  });

  await db.insert(feePayments).values(paymentRows);

  console.log("Submitting today's attendance register (8 students)...");

  const today = new Date().toISOString().slice(0, 10);
  await db.insert(attendanceRecords).values(
    insertedStudents.map((student, i) => ({
      classId: insertedClasses[i].id,
      studentId: student.id,
      date: today,
      status: i % 4 === 0 ? ("absent" as const) : ("present" as const),
      markedBy: teacherIds[i],
    })),
  );

  console.log("Writing academic reports for the current term (8 students)...");

  await db.insert(academicReports).values(
    insertedStudents.map((student, i) => {
      const sent = i % 2 === 0;
      return {
        studentId: student.id,
        classId: insertedClasses[i].id,
        teacherId: teacherIds[i],
        termId: currentTerm.id,
        summary: `${student.firstName} is performing well this term, with steady improvement in core subjects and good class participation.`,
        status: sent ? ("sent" as const) : ("draft" as const),
        sentBy: sent ? secretaryId : null,
        sentAt: sent ? new Date() : null,
      };
    }),
  );

  console.log("\nSeed complete:");
  console.log(`  1 secretary, ${teacherIds.length} teachers, ${parentIds.length} parents`);
  console.log(`  ${insertedClasses.length} classes, ${insertedTerms.length} terms`);
  console.log(`  ${insertedClassTermFees.length} class_term_fees`);
  console.log(`  ${insertedStudents.length} students, ${guardianRows.length} student_guardians`);
  console.log(`  ${insertedFeeRecords.length} fee_records, ${paymentRows.length} fee_payments`);
  console.log(`  8 attendance_records, 8 academic_reports`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
