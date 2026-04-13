/**
 * Seed script — creates demo users for development
 * Run: node scripts/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const DEMO_USERS = [
  {
    fullName: 'Demo User',
    email: 'demo@hackmatch.dev',
    password: 'Demo1234',
    username: 'demo',
    bio: 'Full-stack developer passionate about building impactful products at hackathons.',
    skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
    experienceLevel: 'Intermediate',
    location: 'San Francisco, CA',
    githubUsername: 'demo',
    preferredRoles: ['Fullstack', 'Backend'],
    lookingForTeam: true,
    isPublic: true,
  },
  {
    fullName: 'Priya Nair',
    email: 'priya@hackmatch.dev',
    password: 'Demo1234',
    username: 'priya',
    bio: 'ML engineer specializing in NLP and LLM fine-tuning. Love turning research into products.',
    skills: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'AWS'],
    experienceLevel: 'Advanced',
    location: 'London, UK',
    githubUsername: 'priya',
    preferredRoles: ['ML/AI', 'Backend'],
    lookingForTeam: true,
    isPublic: true,
  },
  {
    fullName: 'James Kim',
    email: 'james@hackmatch.dev',
    password: 'Demo1234',
    username: 'jamesk',
    bio: 'Frontend developer obsessed with performance and accessibility. Next.js advocate.',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma'],
    experienceLevel: 'Intermediate',
    location: 'Toronto, Canada',
    githubUsername: 'jamesk',
    preferredRoles: ['Frontend'],
    lookingForTeam: false,
    isPublic: true,
  },
  {
    fullName: 'Alex Chen',
    email: 'alex@hackmatch.dev',
    password: 'Demo1234',
    username: 'alexc',
    bio: 'UX/UI Designer with a background in cognitive psychology. Making things beautiful and usable.',
    skills: ['Figma', 'UI Design', 'UX', 'User Research', 'Prototyping'],
    experienceLevel: 'Advanced',
    location: 'New York, NY',
    preferredRoles: ['Design'],
    lookingForTeam: true,
    isPublic: true,
  },
  {
    fullName: 'Sarah Jenkins',
    email: 'sarah@hackmatch.dev',
    password: 'Demo1234',
    username: 'sarahj',
    bio: 'Data Engineer handling big data pipelines. Passionate about real-time analytics.',
    skills: ['SQL', 'Spark', 'Kafka', 'Python', 'dbt'],
    experienceLevel: 'Intermediate',
    location: 'Austin, TX',
    preferredRoles: ['Data', 'Backend'],
    lookingForTeam: true,
    isPublic: true,
  },
  {
    fullName: 'Miguel Santos',
    email: 'miguel@hackmatch.dev',
    password: 'Demo1234',
    username: 'miguels',
    bio: 'Mobile dev bringing ideas to life on iOS and Android. Flutter is my go-to.',
    skills: ['Flutter', 'Dart', 'Firebase', 'React Native', 'Swift'],
    experienceLevel: 'Beginner',
    location: 'Lisbon, Portugal',
    preferredRoles: ['Mobile'],
    lookingForTeam: true,
    isPublic: true,
  },
  {
    fullName: 'Fatima El Fassi',
    email: 'fatima@hackmatch.dev',
    password: 'Demo1234',
    username: 'fatimae',
    bio: 'DevOps wizard keeping the servers running and deployments smooth.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    experienceLevel: 'Advanced',
    location: 'Berlin, Germany',
    preferredRoles: ['DevOps'],
    lookingForTeam: true,
    isPublic: true,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackmatch');
    console.log('Connected to MongoDB');

    for (const userData of DEMO_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`Skipping ${userData.email} — already exists`);
        continue;
      }
      const user = await User.create(userData);
      console.log(`✅ Created: ${user.email} (${user.username})`);
    }

    console.log('\nSeed complete. Login with: demo@hackmatch.dev / Demo1234');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
