const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  role: { type: String },
  resumeUrl: { type: String },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});

module.exports = mongoose.model('Student', StudentSchema);