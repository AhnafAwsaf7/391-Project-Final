const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const User             = require('../models/User');
const Skill            = require('../models/Skill');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const JobPosterProfile = require('../models/JobPosterProfile');
const Job              = require('../models/Job');
const Application      = require('../models/Application');
const Review           = require('../models/Review');

const MONGO_URI = 'mongodb://ahnafawsaf14_db_user:WarmachinerockX@ac-1cczror-shard-00-00.bcjjznq.mongodb.net:27017,ac-1cczror-shard-00-01.bcjjznq.mongodb.net:27017,ac-1cczror-shard-00-02.bcjjznq.mongodb.net:27017/job_marketplace?ssl=true&replicaSet=atlas-wc49uu-shard-0&authSource=admin&retryWrites=true&w=majority';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('🌱 Connected to MongoDB — seeding...');

  // Wipe existing data
  await Promise.all([
    User.deleteMany(), Skill.deleteMany(), JobSeekerProfile.deleteMany(),
    JobPosterProfile.deleteMany(), Job.deleteMany(), Application.deleteMany(), Review.deleteMany(),
  ]);
  console.log('🗑  Cleared old data');

  // ── Skills ─────────────────────────────────────────────────────────────────
  const skillDefs = [
    { name: 'javascript',    category: 'technology' },
    { name: 'react',         category: 'technology' },
    { name: 'node.js',       category: 'technology' },
    { name: 'python',        category: 'technology' },
    { name: 'mongodb',       category: 'technology' },
    { name: 'typescript',    category: 'technology' },
    { name: 'graphql',       category: 'technology' },
    { name: 'docker',        category: 'technology' },
    { name: 'figma',         category: 'design' },
    { name: 'ui/ux design',  category: 'design' },
    { name: 'copywriting',   category: 'writing' },
    { name: 'seo',           category: 'marketing' },
    { name: 'data analysis', category: 'finance' },
    { name: 'java',          category: 'technology' },
    { name: 'devops',        category: 'technology' },
  ];
  const skills = await Skill.insertMany(skillDefs);
  const skillMap = Object.fromEntries(skills.map(s => [s.name, s._id]));
  console.log(`✅ Created ${skills.length} skills`);

  // ── Admin ───────────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'System Admin',
    email: 'admin@jobmarket.dev',
    password: 'Admin@1234',
    role: 'systemadmin',
    isVerified: true,
  });
  console.log('✅ Created admin: admin@jobmarket.dev / Admin@1234');

  // ── Job Posters ─────────────────────────────────────────────────────────────
  const posterDefs = [
    { name: 'TechNova Inc',     email: 'technova@jobmarket.dev',  company: 'TechNova Inc',      industry: 'SaaS',        size: '51-200' },
    { name: 'DesignHub Studio', email: 'designhub@jobmarket.dev', company: 'DesignHub Studio',  industry: 'Design',      size: '11-50'  },
    { name: 'DataStream Corp',  email: 'datastream@jobmarket.dev',company: 'DataStream Corp',   industry: 'Analytics',   size: '201-500'},
  ];

  const posterUsers = [];
  for (const p of posterDefs) {
    const u = await User.create({ name: p.name, email: p.email, password: 'Poster@1234', role: 'jobposter', isVerified: true });
    await JobPosterProfile.create({
      user: u._id, companyName: p.company, companyDescription: `${p.company} — a leader in the ${p.industry} space.`,
      industry: p.industry, companySize: p.size, location: 'Remote / USA',
    });
    posterUsers.push(u);
  }
  console.log(`✅ Created ${posterUsers.length} job posters  (password: Poster@1234)`);

  // ── Job Seekers ─────────────────────────────────────────────────────────────
  const seekerDefs = [
    { name: 'Alice Rahman',   email: 'alice@jobmarket.dev',   skills: ['react','javascript','typescript'],       rate: 55, bio: 'Full-stack dev passionate about clean UI.' },
    { name: 'Bob Chen',       email: 'bob@jobmarket.dev',     skills: ['python','data analysis','mongodb'],      rate: 65, bio: 'Data engineer with 5 yrs experience.'       },
    { name: 'Clara Osei',     email: 'clara@jobmarket.dev',   skills: ['figma','ui/ux design','copywriting'],    rate: 45, bio: 'Product designer who loves research-driven design.' },
    { name: 'David Nguyen',   email: 'david@jobmarket.dev',   skills: ['node.js','graphql','docker'],            rate: 70, bio: 'Backend specialist — APIs & infra.'           },
    { name: 'Eva Kowalski',   email: 'eva@jobmarket.dev',     skills: ['javascript','react','seo'],              rate: 40, bio: 'Frontend dev with marketing sense.'           },
  ];

  const seekerUsers = [];
  for (const s of seekerDefs) {
    const u = await User.create({ name: s.name, email: s.email, password: 'Seeker@1234', role: 'jobseeker', isVerified: true });
    await JobSeekerProfile.create({
      user: u._id, bio: s.bio, headline: s.skills.join(', '),
      skills: s.skills.map(sk => skillMap[sk]).filter(Boolean),
      hourlyRate: s.rate, availability: 'available', location: 'Remote',
    });
    seekerUsers.push(u);
  }
  console.log(`✅ Created ${seekerUsers.length} job seekers  (password: Seeker@1234)`);

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const jobDefs = [
    {
      poster: posterUsers[0]._id, title: 'Senior React Developer',
      description: 'Build and maintain our SaaS dashboard. You will work with React, TypeScript and GraphQL.',
      skills: ['react','typescript','graphql'], type: 'contract', category: 'technology',
      budget: { type: 'hourly', min: 50, max: 90 }, status: 'open',
    },
    {
      poster: posterUsers[0]._id, title: 'Node.js API Engineer',
      description: 'Design REST & GraphQL APIs for our platform. Strong knowledge of MongoDB required.',
      skills: ['node.js','mongodb','graphql'], type: 'full-time', category: 'technology',
      budget: { type: 'fixed', min: 4000, max: 6000 }, status: 'open',
    },
    {
      poster: posterUsers[1]._id, title: 'UI/UX Designer (Figma)',
      description: 'Redesign our mobile app. Must have strong Figma skills and a portfolio of shipped products.',
      skills: ['figma','ui/ux design'], type: 'freelance', category: 'design',
      budget: { type: 'fixed', min: 2000, max: 4000 }, status: 'open',
    },
    {
      poster: posterUsers[1]._id, title: 'Copywriter — SaaS Marketing',
      description: 'Write compelling copy for landing pages, email campaigns, and feature announcements.',
      skills: ['copywriting','seo'], type: 'part-time', category: 'writing',
      budget: { type: 'hourly', min: 30, max: 50 }, status: 'open',
    },
    {
      poster: posterUsers[2]._id, title: 'Data Engineer — Python / MongoDB',
      description: 'Build ETL pipelines, data warehouses, and dashboards for analytics clients.',
      skills: ['python','mongodb','data analysis'], type: 'full-time', category: 'technology',
      budget: { type: 'fixed', min: 5000, max: 8000 }, status: 'open',
    },
    {
      poster: posterUsers[2]._id, title: 'DevOps / Docker Specialist',
      description: 'Containerise micro-services, set up CI/CD pipelines, and manage cloud infrastructure.',
      skills: ['docker','devops','node.js'], type: 'contract', category: 'technology',
      budget: { type: 'hourly', min: 60, max: 100 }, status: 'open',
    },
    {
      poster: posterUsers[0]._id, title: 'JavaScript Tutor (Part-time)',
      description: 'Teach JavaScript fundamentals and React to junior developers via video calls.',
      skills: ['javascript','react'], type: 'part-time', category: 'technology',
      budget: { type: 'hourly', min: 25, max: 40 }, status: 'open',
    },
  ];

  const createdJobs = [];
  for (const j of jobDefs) {
    const job = await Job.create({
      ...j, skills: j.skills.map(sk => skillMap[sk]).filter(Boolean),
    });
    createdJobs.push(job);
  }
  console.log(`✅ Created ${createdJobs.length} jobs`);

  // ── Applications ────────────────────────────────────────────────────────────
  const appDefs = [
    { jobIdx: 0, seekerIdx: 0, status: 'shortlisted', coverLetter: 'I have 4 years with React + TypeScript. Here is my portfolio…', proposedRate: 70 },
    { jobIdx: 0, seekerIdx: 4, status: 'pending',     coverLetter: 'Frontend dev with strong React skills. Excited to contribute!', proposedRate: 65 },
    { jobIdx: 1, seekerIdx: 3, status: 'reviewing',   coverLetter: 'Node.js & GraphQL expert. Led API design at two startups.',     proposedRate: 55 },
    { jobIdx: 2, seekerIdx: 2, status: 'hired',        coverLetter: 'Senior UX designer with Figma expertise. Portfolio attached.',  proposedRate: 45 },
    { jobIdx: 3, seekerIdx: 2, status: 'pending',     coverLetter: 'I also write — see my copywriting samples on my profile.',     proposedRate: 35 },
    { jobIdx: 4, seekerIdx: 1, status: 'shortlisted', coverLetter: 'Python data engineer — 6 yrs ETL and MongoDB experience.',     proposedRate: 70 },
    { jobIdx: 5, seekerIdx: 3, status: 'pending',     coverLetter: 'Docker & K8s specialist. I can start immediately.',            proposedRate: 80 },
    { jobIdx: 6, seekerIdx: 0, status: 'rejected',    coverLetter: 'Happy to tutor JS & React part-time evenings.',               proposedRate: 30 },
  ];

  const createdApps = [];
  for (const a of appDefs) {
    const app = await Application.create({
      job: createdJobs[a.jobIdx]._id, applicant: seekerUsers[a.seekerIdx]._id,
      coverLetter: a.coverLetter, proposedRate: a.proposedRate, status: a.status,
    });
    await Job.findByIdAndUpdate(createdJobs[a.jobIdx]._id, { $inc: { applicationsCount: 1 } });
    createdApps.push(app);
  }
  console.log(`✅ Created ${createdApps.length} applications`);

  // ── Reviews ─────────────────────────────────────────────────────────────────
  const reviewDefs = [
    { reviewerIdx: 'poster0', revieweeIdx: 'seeker2', jobIdx: 2, rating: 5, comment: 'Clara delivered stunning designs ahead of schedule. Highly recommended!' },
    { reviewerIdx: 'seeker2', revieweeIdx: 'poster1', jobIdx: 2, rating: 4, comment: 'Great team to work with, clear briefs, and fast feedback.' },
    { reviewerIdx: 'poster0', revieweeIdx: 'seeker0', jobIdx: 0, rating: 5, comment: 'Alice is an exceptional React developer — clean code, proactive communication.' },
    { reviewerIdx: 'seeker1', revieweeIdx: 'poster2', jobIdx: 4, rating: 4, comment: 'DataStream had an interesting project. Could improve feedback cycles.' },
  ];

  const resolveUser = (key) => {
    if (key.startsWith('poster')) return posterUsers[parseInt(key.replace('poster', ''))];
    return seekerUsers[parseInt(key.replace('seeker', ''))];
  };

  for (const r of reviewDefs) {
    await Review.create({
      reviewer: resolveUser(r.reviewerIdx)._id,
      reviewee: resolveUser(r.revieweeIdx)._id,
      job: createdJobs[r.jobIdx]._id,
      rating: r.rating,
      comment: r.comment,
    });
  }
  console.log(`✅ Created ${reviewDefs.length} reviews`);

  console.log('\n🎉 Seed complete!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Admin   : admin@jobmarket.dev      / Admin@1234');
  console.log('Posters : technova@jobmarket.dev   / Poster@1234');
  console.log('          designhub@jobmarket.dev  / Poster@1234');
  console.log('          datastream@jobmarket.dev / Poster@1234');
  console.log('Seekers : alice@jobmarket.dev      / Seeker@1234');
  console.log('          bob@jobmarket.dev        / Seeker@1234');
  console.log('          clara@jobmarket.dev      / Seeker@1234');
  console.log('========================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
