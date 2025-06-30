const Student = require('../models/Student');
const Team = require('../models/Team');
const InterviewScore = require('../models/InterviewScore');

// GET /api/students?department=...
async function listStudents(req, res) {
  try {
    const { department } = req.query;
    const filter = { organization: req.user.organization };
    if (department) filter.department = department;
    const students = await Student.find(filter)
      .populate({ path: 'department', model: 'Department', select: 'name' })
      .populate({ path: 'teamId', select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl' });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/students/:id
async function getStudent(req, res) {
  try {
    const student = await Student.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate({ path: 'department', model: 'Department', select: 'name' })
      .populate({ path: 'teamId', select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl' });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/students/:id
async function updateStudentResume(req, res) {
  try {
    const { resumeUrl } = req.body;
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      { resumeUrl },
      { new: true }
    ).populate({ path: 'teamId', select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl' });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/students/:id
async function deleteStudent(req, res) {
  try {
    const student = await Student.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await InterviewScore.deleteMany({ studentId: student._id, organization: req.user.organization });
    if (student.teamId) {
      const team = await Team.findOne({ _id: student.teamId, organization: req.user.organization });
      if (team) {
        team.students = team.students.filter(s => s.toString() !== student._id.toString());
        if (team.students.length === 0) {
          await InterviewScore.deleteMany({ teamId: team._id, organization: req.user.organization });
          await Team.findByIdAndDelete(team._id);
        } else {
          await team.save();
        }
      }
    }
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/students
async function deleteMultipleStudents(req, res) {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }
    const students = await Student.find({ _id: { $in: studentIds }, organization: req.user.organization });
    await InterviewScore.deleteMany({ studentId: { $in: studentIds }, organization: req.user.organization });
    const teamStudents = {};
    students.forEach(student => {
      if (student.teamId) {
        if (!teamStudents[student.teamId]) {
          teamStudents[student.teamId] = [];
        }
        teamStudents[student.teamId].push(student._id);
      }
    });
    for (const [teamId, studentIdsToRemove] of Object.entries(teamStudents)) {
      const team = await Team.findOne({ _id: teamId, organization: req.user.organization });
      if (team) {
        team.students = team.students.filter(s => !studentIdsToRemove.some(id => id.toString() === s.toString()));
        if (team.students.length === 0) {
          await InterviewScore.deleteMany({ teamId: teamId, organization: req.user.organization });
          await Team.findByIdAndDelete(teamId);
        } else {
          await team.save();
        }
      }
    }
    await Student.deleteMany({ _id: { $in: studentIds }, organization: req.user.organization });
    res.json({ message: `${students.length} student(s) deleted successfully`, deletedCount: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listStudents,
  getStudent,
  updateStudentResume,
  deleteStudent,
  deleteMultipleStudents
}; 