const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamNumber: { type: Number },
  projectTitle: { type: String },
  domain: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  checkpoints: {
    ideation: { type: Boolean, default: false },
    workSplit: { type: Boolean, default: false },
    localProjectDone: { type: Boolean, default: false },
    projectHosted: { type: Boolean, default: false }
  },
  completed: { type: Boolean, default: false },
  githubUrl: { type: String },
  hostedUrl: { type: String }
});

// Auto-calculate 'completed' before save
TeamSchema.pre('save', function (next) {
  const cp = this.checkpoints;
  this.completed = cp.ideation && cp.workSplit && cp.localProjectDone && cp.projectHosted;
  next();
});

module.exports = mongoose.model('Team', TeamSchema);