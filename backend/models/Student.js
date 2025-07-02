const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  role: { type: String },
  resumeUrl: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  organization: { type: String, required: true },
  registeredNumber: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows multiple null/undefined values
    lowercase: true, // Store in lowercase to avoid case sensitivity issues
    trim: true // Remove whitespace
  }
});

// Create a compound index for organization + registeredNumber to ensure uniqueness within organization
StudentSchema.index({ organization: 1, registeredNumber: 1 }, { 
  unique: true, 
  sparse: true 
});

module.exports = mongoose.model('Student', StudentSchema);