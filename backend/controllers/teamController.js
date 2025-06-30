const Team = require('../models/Team');
const Student = require('../models/Student');
const Department = require('../models/Department');
const InterviewScore = require('../models/InterviewScore');

// Add Team (with students)
async function addTeam(req, res) {
  try {
    const { projectTitle, projectDescription, domain, teamNumber, githubUrl, hostedUrl, students = [] } = req.body;
    let newTeamNumber = teamNumber;
    if (!newTeamNumber) {
      const lastTeam = await Team.findOne({ organization: req.user.organization }).sort({ teamNumber: -1 });
      newTeamNumber = lastTeam ? lastTeam.teamNumber + 1 : 1;
    }
    const team = new Team({ teamNumber: newTeamNumber, projectTitle, projectDescription, domain, githubUrl, hostedUrl, organization: req.user.organization });
    await team.save();
    const studentIds = [];
    for (const s of students) {
      const student = new Student({ name: s.name, department: s.department, role: s.role, resumeUrl: s.resumeUrl, teamId: team._id, organization: req.user.organization });
      await student.save();
      studentIds.push(student._id);
    }
    team.students = studentIds;
    await team.save();
    await team.populate({ path: 'students', populate: { path: 'department', model: 'Department' } });
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// List Teams
async function listTeams(req, res) {
  try {
    const teams = await Team.find({ organization: req.user.organization })
      .populate({ path: 'students', populate: { path: 'department', model: 'Department' } });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get Team Detail
async function getTeamDetail(req, res) {
  try {
    const team = await Team.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate({ path: 'students', populate: { path: 'department', model: 'Department' } });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update GitHub/Hosted URLs
async function updateTeamUrls(req, res) {
  try {
    const team = await Team.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.body.githubUrl !== undefined) team.githubUrl = req.body.githubUrl;
    if (req.body.hostedUrl !== undefined) team.hostedUrl = req.body.hostedUrl;
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Update Team Details
async function updateTeamDetails(req, res) {
  try {
    const { projectTitle, domain, projectDescription, students } = req.body;
    const team = await Team.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (projectTitle !== undefined) team.projectTitle = projectTitle;
    if (domain !== undefined) team.domain = domain;
    if (projectDescription !== undefined) team.projectDescription = projectDescription;
    await team.save();
    if (students && Array.isArray(students)) {
      for (const studentUpdate of students) {
        if (studentUpdate._id && studentUpdate.role !== undefined) {
          await Student.findOneAndUpdate(
            { _id: studentUpdate._id, organization: req.user.organization },
            { role: studentUpdate.role }
          );
        }
      }
    }
    await team.populate({ path: 'students', populate: { path: 'department', model: 'Department' } });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/teams/:id
async function deleteTeam(req, res) {
  try {
    const team = await Team.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    await InterviewScore.deleteMany({ teamId: team._id, organization: req.user.organization });
    if (team.students && team.students.length > 0) {
      await Student.deleteMany({ _id: { $in: team.students }, organization: req.user.organization });
    }
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/teams
async function deleteMultipleTeams(req, res) {
  try {
    const { teamIds } = req.body;
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({ error: 'Team IDs array is required' });
    }
    const teams = await Team.find({ _id: { $in: teamIds }, organization: req.user.organization });
    // Collect all student IDs to delete
    // ... (rest of the function as in the route file)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addTeam,
  listTeams,
  getTeamDetail,
  updateTeamUrls,
  updateTeamDetails,
  deleteTeam,
  deleteMultipleTeams
}; 