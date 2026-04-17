const mongoose = require('mongoose');

const stringField = (max) => ({
  type: String,
  trim: true,
  maxlength: max,
  default: '',
});

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { ...stringField(60), default: 'Untitled Resume' },
  template: { type: String, enum: ['modern', 'classic', 'minimal', 'creative'], default: 'modern' },
  personalInfo: {
    fullName: stringField(50),
    email: stringField(100),
    phone: stringField(10),
    location: stringField(100),
    linkedin: stringField(200),
    github: stringField(200),
    website: stringField(200),
    summary: stringField(300),
  },
  education: [{
    school: stringField(100),
    degree: stringField(100),
    field: stringField(100),
    startYear: stringField(4),
    endYear: stringField(4),
    gpa: stringField(20),
  }],
  experience: [{
    company: stringField(100),
    position: stringField(100),
    location: stringField(100),
    startDate: stringField(30),
    endDate: stringField(30),
    current: { type: Boolean, default: false },
    description: stringField(500),
  }],
  skills: [stringField(40)],
  projects: [{
    title: stringField(100),
    description: stringField(400),
    link: stringField(200),
  }],
  certifications: [{
    name: stringField(100),
    issuer: stringField(100),
    date: stringField(30),
    link: stringField(200),
  }],
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
