/**
 * Sample Seed Data for Event Management System (Project 9)
 * All records clearly labeled as sample data.
 */

const sampleUsers = [
  // 1 Admin (Seeded only, never self-registered)
  {
    name: 'Eleanor Vance (Admin)',
    email: 'admin@eventbox.com',
    password: 'Admin@123456',
    role: 'admin',
    isActive: true,
  },
  // 2 Organizers
  {
    name: 'Marcus Sterling (Metro Arts)',
    email: 'organizer1@eventbox.com',
    password: 'Org@123456',
    role: 'organizer',
    isActive: true,
  },
  {
    name: 'Dr. Sarah Lin (Tech Summit)',
    email: 'organizer2@eventbox.com',
    password: 'Org@123456',
    role: 'organizer',
    isActive: true,
  },
  // 5 Attendees
  {
    name: 'Liam Chen',
    email: 'attendee1@eventbox.com',
    password: 'User@123456',
    role: 'attendee',
    isActive: true,
  },
  {
    name: 'Aria Montgomery',
    email: 'attendee2@eventbox.com',
    password: 'User@123456',
    role: 'attendee',
    isActive: true,
  },
  {
    name: 'Devon Miller',
    email: 'attendee3@eventbox.com',
    password: 'User@123456',
    role: 'attendee',
    isActive: true,
  },
  {
    name: 'Priya Sharma',
    email: 'attendee4@eventbox.com',
    password: 'User@123456',
    role: 'attendee',
    isActive: true,
  },
  {
    name: 'Lucas Rossi',
    email: 'attendee5@eventbox.com',
    password: 'User@123456',
    role: 'attendee',
    isActive: true,
  },
];

const sampleVenues = [
  {
    name: 'The Grand Opera House',
    address: '452 Saint Marks Avenue',
    city: 'New York',
    capacity: 1200,
  },
  {
    name: 'Kite & Key Innovation Pavilion',
    address: '100 Tech Wharf Way',
    city: 'San Francisco',
    capacity: 850,
  },
  {
    name: 'Old Mill Foundry & Studios',
    address: '14 Industrial Canal Rd',
    city: 'Chicago',
    capacity: 400,
  },
];

const getSampleEvents = (venueIds, organizerIds) => [
  {
    title: 'Midwest Chamber Symphonia: Bach & Glass',
    description: 'An evening of contrasting counterpoints featuring the acclaimed Midwest Chamber Symphonia performing classical Bach and minimalist Philip Glass.',
    category: 'Concert',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    venue: venueIds[0],
    organizer: organizerIds[0],
    status: 'published',
    capacity: 500,
  },
  {
    title: 'Distributed Systems & Data Engineering Summit 2026',
    description: 'Keynotes, deep-dives, and peer discussions on large-scale distributed architectures, streaming engines, and fault tolerance in mission-critical workloads.',
    category: 'Conference',
    startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // in 12 days
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    venue: venueIds[1],
    organizer: organizerIds[1],
    status: 'published',
    capacity: 800,
  },
  {
    title: 'Modern Typography & Book Arts Masterclass',
    description: 'Hands-on linotype setting, digital serif drafting, and proportional grid mechanics for editorial typographers.',
    category: 'Workshop',
    startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
    venue: venueIds[2],
    organizer: organizerIds[0],
    status: 'published',
    capacity: 50,
  },
  {
    title: 'Applied AI & Production Inference Seminar',
    description: 'A pragmatic review of deploying edge models, latency reduction, and observability in production inference clusters.',
    category: 'Seminar',
    startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
    venue: venueIds[1],
    organizer: organizerIds[1],
    status: 'published',
    capacity: 250,
  },
  {
    title: 'Metropolis Indie Film & Screenwriters Meetup',
    description: 'Informal table reads, peer pitch sessions, and distributor Q&A for independent narrative directors and screenwriters.',
    category: 'Meetup',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    venue: venueIds[2],
    organizer: organizerIds[0],
    status: 'draft',
    capacity: 100,
  },
  {
    title: 'Heritage Printmaking & Copperplate Exhibition',
    description: 'Archive showcase of historic woodcuts, stone lithography, and intaglio press impressions curated from national guild collections.',
    category: 'Exhibition',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Past event
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    venue: venueIds[0],
    organizer: organizerIds[0],
    status: 'completed',
    capacity: 300,
  },
];

module.exports = {
  sampleUsers,
  sampleVenues,
  getSampleEvents,
};
