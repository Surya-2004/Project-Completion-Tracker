const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamNumber: { type: Number },
  projectTitle: { type: String },
  projectDescription: { type: String },
  domain: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  completed: { type: Boolean, default: false },
  githubUrl: { type: String },
  hostedUrl: { type: String },
  checkpoints: {
    type: [
      {
        name: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ],
    default: [
      { name: 'Ideation', completed: false },
      { name: 'Work Split', completed: false },
      { name: 'Local Done', completed: false },
      { name: 'Hosted', completed: false }
    ]
  }
});

module.exports = mongoose.model('Team', TeamSchema);