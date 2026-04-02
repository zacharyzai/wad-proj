/**
 * Seed script — populates the active DB (set via DB= in config.env) with
 * realistic SMU event data: users, events, RSVPs, reviews, notifications.
 *
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config.env') });

const User = require('../models/user-models');
const Event = require('../models/event-models');
const RSVP = require('../models/rsvp-models');
const Review = require('../models/review-models');
const Notification = require('../models/notification-models');

async function seed() {
  await mongoose.connect(process.env.DB);
  console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);

  // Clear all collections first
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    RSVP.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data\n');

  // ─── Users ───────────────────────────────────────────────────────────────────
  const SALT_ROUNDS = 10;
  const adminHash   = await bcrypt.hash('password123', SALT_ROUNDS);
  const orgHash     = await bcrypt.hash('password123', SALT_ROUNDS);
  const studentHash = await bcrypt.hash('password123', SALT_ROUNDS);

  const [admin, org1, org2, org3, alice, bob, clara, david, emma, faris] =
    await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@smu.edu.sg',
        passwordHash: adminHash,
        role: 'admin',
        studentId: '',
        faculty: '',
        bio: 'System administrator for SMU Events.',
      },
      {
        name: 'SMU Tech Club',
        email: 'techclub@smu.edu.sg',
        passwordHash: orgHash,
        role: 'organizer',
        studentId: '',
        faculty: 'School of Computing & Information Systems',
        bio: 'Organising tech events, hackathons and workshops at SMU.',
      },
      {
        name: 'SMU Sports Club',
        email: 'sportsclub@smu.edu.sg',
        passwordHash: orgHash,
        role: 'organizer',
        studentId: '',
        faculty: 'Office of Student Life',
        bio: 'Promoting sports and active living across SMU.',
      },
      {
        name: 'SMU Business Club',
        email: 'bizclub@smu.edu.sg',
        passwordHash: orgHash,
        role: 'organizer',
        studentId: '',
        faculty: 'Lee Kong Chian School of Business',
        bio: 'Connecting aspiring business leaders through competitions and networking events.',
      },
      {
        name: 'Alice Tan',
        email: 'alice.tan.2023@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234567A',
        faculty: 'School of Computing & Information Systems',
        bio: 'Year 2 CS student passionate about AI and web development.',
      },
      {
        name: 'Bob Lim',
        email: 'bob.lim.2023@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234568B',
        faculty: 'Lee Kong Chian School of Business',
        bio: 'Business student with a love for entrepreneurship and case competitions.',
      },
      {
        name: 'Clara Ng',
        email: 'clara.ng.2022@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234569C',
        faculty: 'School of Economics',
        bio: 'Econ major interested in fintech and data analytics.',
      },
      {
        name: 'David Koh',
        email: 'david.koh.2024@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234570D',
        faculty: 'School of Accountancy',
        bio: 'First year accountancy student exploring campus life.',
      },
      {
        name: 'Emma Wong',
        email: 'emma.wong.2022@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234571E',
        faculty: 'College of Integrative Studies',
        bio: 'Double degree student balancing studies and campus activities.',
      },
      {
        name: 'Faris Malik',
        email: 'faris.malik.2023@smu.edu.sg',
        passwordHash: studentHash,
        role: 'student',
        studentId: '01234572F',
        faculty: 'School of Social Sciences',
        bio: 'Socio major who enjoys community service and campus events.',
      },
    ]);
  console.log('Users seeded (10 total: 1 admin, 3 organizers, 6 students)');

  // ─── Events ──────────────────────────────────────────────────────────────────
  // Past events:     before April 3 2026 (today) → eligible for reviews
  // Upcoming events: from April 3 2026 onward    → eligible for RSVPs
  const events = await Event.insertMany([
    // ── PAST ──
    {
      title: 'SMU Hackathon 2026',
      description:
        'A 24-hour hackathon where teams build innovative solutions to real-world problems. Open to all SMU students. Cash prizes and internship opportunities from our sponsors await the top three teams!',
      date: new Date('2026-02-15T09:00:00'),
      location: 'SCIS SR2-1',
      category: ['Hackathons'],
      maxAttendees: 80,
      organiser: org1._id,
      attendees: [alice._id, bob._id, clara._id, david._id],
    },
    {
      title: 'Inter-Faculty Basketball Tournament',
      description:
        'Annual inter-faculty basketball tournament. Represent your school and compete for the championship trophy. All skill levels are welcome — just sign your faculty team up and come ready to play!',
      date: new Date('2026-02-28T14:00:00'),
      location: 'YPHSL SR B1-1',
      category: ['Sports'],
      maxAttendees: 60,
      organiser: org2._id,
      attendees: [bob._id, david._id, faris._id],
    },
    {
      title: 'Business Case Competition Bootcamp',
      description:
        'An intensive weekend bootcamp to sharpen your case-solving skills ahead of national competitions. Industry mentors and mock presentations included. Participants will receive a certificate of completion.',
      date: new Date('2026-03-08T10:00:00'),
      location: 'LKCSB SR 3.1',
      category: ['Networking'],
      maxAttendees: 40,
      organiser: org3._id,
      attendees: [bob._id, clara._id, emma._id],
    },
    {
      title: 'Python for Data Science Workshop',
      description:
        'Hands-on workshop covering pandas, matplotlib, and scikit-learn with real datasets. Bring your laptop! Suitable for students with basic Python knowledge. Refreshments provided.',
      date: new Date('2026-03-20T13:00:00'),
      location: 'SCIS SR3.5',
      category: ['Hackathons', 'Discussions'],
      maxAttendees: 30,
      organiser: org1._id,
      attendees: [alice._id, clara._id, david._id, emma._id],
    },
    // ── UPCOMING ──
    {
      title: 'AI & Machine Learning Symposium',
      description:
        'Join industry leaders and researchers for a full-day symposium exploring the latest advances in AI and ML. Panel discussions, lightning talks, and networking sessions included. Lunch provided for registered participants.',
      date: new Date('2026-04-18T09:00:00'),
      location: 'SCIS SR2-1',
      category: ['Discussions', 'Networking'],
      maxAttendees: 100,
      organiser: org1._id,
      attendees: [alice._id, clara._id],
    },
    {
      title: 'Mid-Semester Welfare Pack Collection',
      description:
        'Pick up your mid-semester welfare pack from SMU Connex. Packed with snacks, stationery, and self-care items sponsored by the Student Council. One pack per registered student — first come, first served.',
      date: new Date('2026-04-22T11:00:00'),
      location: 'SMU Connex',
      category: ['General'],
      maxAttendees: 500,
      organiser: org2._id,
      attendees: [alice._id, bob._id, clara._id, david._id, emma._id, faris._id],
    },
    {
      title: 'Mock Interview Night',
      description:
        'Practice your interview skills with professionals from top consulting, finance, and tech firms. Sign up for a 20-minute mock interview slot followed by personalised feedback. Dress code: business formal.',
      date: new Date('2026-05-06T18:00:00'),
      location: 'LKCSB SR 3.1',
      category: ['Networking'],
      maxAttendees: 50,
      organiser: org3._id,
      attendees: [bob._id, emma._id],
    },
    {
      title: 'SMU Cultural Food Festival',
      description:
        'Celebrate diversity through food! Student cultural clubs from across SMU bring dishes representing cuisines from around the world. Free entry — bring your appetite, your friends, and your campus card.',
      date: new Date('2026-05-15T12:00:00'),
      location: 'SMU Admin Building',
      category: ['Festivals'],
      maxAttendees: 300,
      organiser: org2._id,
      attendees: [alice._id, faris._id],
    },
    {
      title: 'FinTech Innovation Talk',
      description:
        "A panel discussion featuring founders of Singapore's leading fintech startups on the future of digital payments, DeFi, and MAS regulatory trends. Live Q&A session and networking drinks after the panel.",
      date: new Date('2026-05-22T17:00:00'),
      location: 'SOE SR 2.8',
      category: ['Discussions'],
      maxAttendees: 60,
      organiser: org3._id,
      attendees: [clara._id, bob._id],
    },
    {
      title: 'Freshmen Welcome Carnival',
      description:
        'Welcome the Class of 2030! Join us for games, club booths, live performances, and freebies spread across the SMU campus. All students are encouraged to come show some school spirit and help our newest batch feel at home.',
      date: new Date('2026-06-10T10:00:00'),
      location: 'SMU Admin Building',
      category: ['Festivals', 'General'],
      maxAttendees: 1000,
      organiser: org1._id,
      attendees: [alice._id, bob._id, faris._id],
    },
  ]);
  console.log('Events seeded (4 past, 6 upcoming)');

  const [hackathon, basketball, caseBoot, pyWorkshop] = events; // past events

  // ─── RSVPs ───────────────────────────────────────────────────────────────────
  const rsvpData = [];
  for (const event of events) {
    for (const userId of event.attendees) {
      rsvpData.push({ event: event._id, user: userId, status: 'attending' });
    }
  }
  await RSVP.insertMany(rsvpData);
  console.log(`RSVPs seeded (${rsvpData.length} total)`);

  // ─── Reviews (past events only) ──────────────────────────────────────────────
  const reviewData = [
    // Hackathon
    {
      event: hackathon._id, user: alice._id, rating: 5,
      title: 'Best hackathon yet!',
      comment: 'Super well-organised event. The mentors were incredibly helpful and the problem statements were realistic. Walked away with a project I am genuinely proud of. Will definitely be back next year!',
    },
    {
      event: hackathon._id, user: bob._id, rating: 4,
      title: 'Great networking opportunity',
      comment: 'Met so many talented people from different faculties. The judging criteria were clear and the final presentations were inspiring. Only gripe — the catering ran out a bit early!',
    },
    {
      event: hackathon._id, user: clara._id, rating: 4,
      title: 'Solid experience overall',
      comment: 'Loved the diversity of team backgrounds. The sponsors provided really interesting challenges. Would recommend to any student who wants to apply classroom knowledge to real problems.',
    },
    // Basketball tournament
    {
      event: basketball._id, user: bob._id, rating: 5,
      title: 'Epic games all day!',
      comment: 'High energy from start to finish. The court was well set up and the referees were fair. LKCSB team put up a great fight — see you next year for the rematch!',
    },
    {
      event: basketball._id, user: faris._id, rating: 4,
      title: 'Great inter-faculty rivalry',
      comment: 'Fantastic atmosphere and plenty of school spirit. My only suggestion would be to add more courts to cut down on waiting time between matches, but overall a really fun day.',
    },
    // Case bootcamp
    {
      event: caseBoot._id, user: bob._id, rating: 5,
      title: 'Incredibly useful workshop',
      comment: 'The industry mentors gave brutally honest feedback that I genuinely needed to hear. The framework drills were intense but the practice paid off at the actual competition the following week.',
    },
    {
      event: caseBoot._id, user: clara._id, rating: 4,
      title: 'Thorough case prep',
      comment: 'Covered MBB-style frameworks and market sizing thoroughly. Would have liked more time for group practice rounds, but the quality of the mentors more than made up for the tight schedule.',
    },
    {
      event: caseBoot._id, user: emma._id, rating: 3,
      title: 'Good content, a bit rushed',
      comment: 'The material was excellent but we ran out of time on the final module. I hope future editions are spread across two days so each topic can be covered properly.',
    },
    // Python workshop
    {
      event: pyWorkshop._id, user: alice._id, rating: 5,
      title: 'Hands-on and practical',
      comment: 'Loved working through real datasets rather than toy examples. The instructor explained complex concepts clearly and the reference cheat sheet provided is something I still use weekly.',
    },
    {
      event: pyWorkshop._id, user: clara._id, rating: 5,
      title: 'Perfect for beginners',
      comment: 'Came in with minimal pandas experience and left feeling genuinely confident. The pacing was just right and the exercises were relevant to econometrics work I am doing in class.',
    },
    {
      event: pyWorkshop._id, user: david._id, rating: 4,
      title: 'Solid intro to data science',
      comment: 'Well-paced and the exercises were clearly designed with beginners in mind. The ML portion felt slightly rushed but the foundations covered in the first half were really solid.',
    },
  ];

  const insertedReviews = await Review.insertMany(reviewData);
  console.log(`Reviews seeded (${insertedReviews.length} total)`);

  // Attach review ObjectIds back onto each event
  const reviewsByEvent = {};
  insertedReviews.forEach((r) => {
    const key = r.event.toString();
    if (!reviewsByEvent[key]) reviewsByEvent[key] = [];
    reviewsByEvent[key].push(r._id);
  });
  await Promise.all(
    Object.entries(reviewsByEvent).map(([eventId, reviewIds]) =>
      Event.findByIdAndUpdate(eventId, { $set: { reviews: reviewIds } })
    )
  );
  console.log('Event.reviews references updated');

  // ─── Notifications ────────────────────────────────────────────────────────────
  await Notification.insertMany([
    { recipient: alice._id,  message: 'Your RSVP for "AI & Machine Learning Symposium" has been confirmed!', isRead: false },
    { recipient: alice._id,  message: 'Reminder: "AI & Machine Learning Symposium" is coming up on 18 Apr — see you there!', isRead: true },
    { recipient: alice._id,  message: 'A new review was posted on "SMU Hackathon 2026" that you attended.', isRead: true },
    { recipient: bob._id,    message: 'Your RSVP for "Mock Interview Night" has been confirmed!', isRead: false },
    { recipient: bob._id,    message: 'New event you might like: "FinTech Innovation Talk" on 22 May at SOE SR 2.8.', isRead: false },
    { recipient: clara._id,  message: 'Your RSVP for "FinTech Innovation Talk" has been confirmed!', isRead: false },
    { recipient: clara._id,  message: 'Reminder: "Mid-Semester Welfare Pack Collection" is on 22 Apr at SMU Connex.', isRead: true },
    { recipient: david._id,  message: 'You have successfully registered for "Mid-Semester Welfare Pack Collection".', isRead: true },
    { recipient: emma._id,   message: 'Your RSVP for "Mock Interview Night" has been confirmed!', isRead: false },
    { recipient: faris._id,  message: 'Your RSVP for "SMU Cultural Food Festival" has been confirmed!', isRead: false },
    { recipient: faris._id,  message: 'Reminder: collect your welfare pack at SMU Connex on 22 Apr between 11am–3pm!', isRead: false },
  ]);
  console.log('Notifications seeded (11 total)');

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n✓ Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Role       Email                          Password');
  console.log('  ---------  -----------------------------  ------------');
  console.log('  admin      admin@smu.edu.sg               password123');
  console.log('  organizer  techclub@smu.edu.sg            password123');
  console.log('  organizer  sportsclub@smu.edu.sg          password123');
  console.log('  organizer  bizclub@smu.edu.sg             password123');
  console.log('  student    alice.tan.2023@smu.edu.sg      password123');
  console.log('  student    bob.lim.2023@smu.edu.sg        password123');
  console.log('  student    clara.ng.2022@smu.edu.sg       password123');
  console.log('  student    david.koh.2024@smu.edu.sg      password123');
  console.log('  student    emma.wong.2022@smu.edu.sg      password123');
  console.log('  student    faris.malik.2023@smu.edu.sg    password123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
