const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamNumber: { type: Number },
  projectTitle: { type: String },
  projectDescription: { type: String },
  domain: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  completed: { type: Boolean, default: false },
  githubUrl: { type: String },
  hostedUrl: { type: String }
});

module.exports = mongoose.model('Team', TeamSchema);