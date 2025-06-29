const mongoose = require('mongoose');

const InterviewScoreSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team' 
  },
  organization: { type: String, required: true },
  metrics: {
    selfIntro: { type: Number, min: 1, max: 10 },
    communication: { type: Number, min: 1, max: 10 },
    confidence: { type: Number, min: 1, max: 10 },
    dsa: { type: Number, min: 1, max: 10 },
    problemSolving: { type: Number, min: 1, max: 10 },
    projectUnderstanding: { type: Number, min: 1, max: 10 },
    techStack: { type: Number, min: 1, max: 10 },
    roleExplanation: { type: Number, min: 1, max: 10 },
    teamwork: { type: Number, min: 1, max: 10 },
    adaptability: { type: Number, min: 1, max: 10 }
  },
  totalScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to calculate total and average scores
InterviewScoreSchema.pre('save', function(next) {
  const metrics = this.metrics;
  const scores = Object.values(metrics).filter(score => score !== null && score !== undefined);
  
  if (scores.length > 0) {
    this.totalScore = scores.reduce((sum, score) => sum + score, 0);
    this.averageScore = Math.round((this.totalScore / scores.length) * 100) / 100;
  } else {
    this.totalScore = 0;
    this.averageScore = 0;
  }
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('InterviewScore', InterviewScoreSchema); 