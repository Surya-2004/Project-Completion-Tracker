const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String },
  organization: { type: String, required: true }
});

module.exports = mongoose.model('Department', DepartmentSchema);