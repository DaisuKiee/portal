const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trackingCode: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected'],
    default: 'pending'
  },
  personalInfo: {
    firstName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    suffix: { type: String, default: '' },
    birthDate: { type: String, default: '' },
    birthPlace: { type: String, default: '' },
    gender: { type: String, default: '' },
    civilStatus: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    nationality: { type: String, default: 'Filipino' },
    religion: { type: String, default: '' },
    address: {
      street: { type: String, default: '' },
      barangay: { type: String, default: '' },
      municipality: { type: String, default: '' },
      province: { type: String, default: '' },
      zipCode: { type: String, default: '' }
    }
  },
  educationalBackground: {
    lastSchoolAttended: { type: String, default: '' },
    schoolAddress: { type: String, default: '' },
    schoolType: { type: String, enum: ['public', 'private', ''], default: '' },
    yearGraduated: { type: String, default: '' },
    lrnNumber: { type: String, default: '' },
    strand: { type: String, default: '' },
    generalAverage: { type: String, default: '' },
    awards: { type: String, default: '' }
  },
  familyBackground: {
    father: {
      fullName: { type: String, default: '' },
      occupation: { type: String, default: '' },
      contactNumber: { type: String, default: '' },
      highestEducation: { type: String, default: '' }
    },
    mother: {
      fullName: { type: String, default: '' },
      occupation: { type: String, default: '' },
      contactNumber: { type: String, default: '' },
      highestEducation: { type: String, default: '' }
    },
    guardian: {
      fullName: { type: String, default: '' },
      relationship: { type: String, default: '' },
      contactNumber: { type: String, default: '' },
      address: { type: String, default: '' }
    },
    numberOfSiblings: { type: Number, default: 0 },
    annualFamilyIncome: { type: String, default: '' }
  },
  preferredCourse: {
    type: String,
    default: ''
  },
  aiRecommendedCourse: {
    type: String,
    default: ''
  },
  aiAnalysis: {
    type: String,
    default: ''
  },
  pretestAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  documentsAcknowledged: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
