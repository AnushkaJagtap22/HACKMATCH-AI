const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  techStack: [{ type: String, trim: true }],
  githubUrl: { type: String, trim: true },
  liveUrl: { type: String, trim: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['team_match', 'invitation', 'team_updated', 'profile_tip', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const TeamHistorySchema = new mongoose.Schema({
  teamId: { type: String },
  members: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, name: String, role: String }],
  score: { type: Number },
  explanation: { type: String },
  breakdown: { type: mongoose.Schema.Types.Mixed },
  leader: { userId: mongoose.Schema.Types.ObjectId, name: String, reason: String },
  formedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['suggested', 'accepted', 'rejected'], default: 'suggested' },
});

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  username: {
    type: String, unique: true, sparse: true, trim: true, lowercase: true,
    minlength: 3, maxlength: 30,
  },
  bio: { type: String, trim: true, maxlength: 500 },
  avatar: { type: String, default: null },
  skills: [{ type: String, trim: true, maxlength: 30 }],
  interests: [{ type: String, trim: true }],
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  location: { type: String, trim: true, maxlength: 100 },
  website: { type: String, trim: true },
  githubUsername: { type: String, trim: true },
  linkedinUrl: { type: String, trim: true },
  twitterHandle: { type: String, trim: true },
  projects: [ProjectSchema],
  resumeUrl: { type: String, default: null },
  resumeParsedData: {
    extractedSkills: [String],
    extractedExperience: String,
    extractedProjects: [String],
    parsedAt: Date,
  },
  skillVector: [{ type: Number }],
  teamHistory: [TeamHistorySchema],
  currentTeamId: { type: String, default: null },
  notifications: [NotificationSchema],
  isPublic: { type: Boolean, default: true },
  lookingForTeam: { type: Boolean, default: false },
  preferredRoles: [{
    type: String,
    enum: ['Frontend', 'Backend', 'Fullstack', 'ML/AI', 'DevOps', 'Design', 'Mobile', 'Data', 'Other'],
  }],
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

UserSchema.index({ skills: 1 });
UserSchema.index({ experienceLevel: 1 });
UserSchema.index({ isPublic: 1, lookingForTeam: 1 });
UserSchema.index({ lastActive: -1 });

UserSchema.virtual('profileCompleteness').get(function () {
  let score = 0;
  const checks = [
    { field: this.fullName, points: 10 },
    { field: this.bio, points: 15 },
    { field: this.avatar, points: 10 },
    { field: this.skills?.length > 0, points: 20 },
    { field: this.projects?.length > 0, points: 20 },
    { field: this.githubUsername, points: 10 },
    { field: this.location, points: 5 },
    { field: this.website, points: 5 },
    { field: this.resumeUrl, points: 5 },
  ];
  checks.forEach(c => { if (c.field) score += c.points; });
  return Math.min(score, 100);
});

UserSchema.virtual('unreadNotificationCount').get(function () {
  return this.notifications?.filter(n => !n.read).length || 0;
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

UserSchema.methods.addNotification = async function (type, title, message, data = {}) {
  this.notifications.unshift({ type, title, message, data });
  if (this.notifications.length > 50) this.notifications = this.notifications.slice(0, 50);
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', UserSchema);
