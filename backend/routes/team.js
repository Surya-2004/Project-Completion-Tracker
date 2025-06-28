const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Student = require('../models/Student');
const Department = require('../models/Department');

// Add Team (with students)
router.post('/', async (req, res) => {
  try {
    const { projectTitle, projectDescription, domain, teamNumber, githubUrl, hostedUrl, students = [] } = req.body;

    // Auto-increment teamNumber if not provided
    let newTeamNumber = teamNumber;
    if (!newTeamNumber) {
      const lastTeam = await Team.findOne().sort({ teamNumber: -1 });
      newTeamNumber = lastTeam ? lastTeam.teamNumber + 1 : 1;
    }

    // Create team (students will be added after)
    const team = new Team({
      teamNumber: newTeamNumber,
      projectTitle,
      projectDescription,
      domain,
      githubUrl,
      hostedUrl
    });
    await team.save();

    // Create students and associate with team
    const studentIds = [];
    for (const s of students) {
      const student = new Student({
        name: s.name,
        department: s.department,
        role: s.role,
        resumeUrl: s.resumeUrl,
        teamId: team._id
      });
      await student.save();
      studentIds.push(student._id);
    }
    team.students = studentIds;
    await team.save();

    // Populate students and department for response
    await team.populate({
      path: 'students',
      populate: { path: 'department', model: 'Department' }
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List Teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate({
        path: 'students',
        populate: { path: 'department', model: 'Department' }
      });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Team Detail
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'students',
        populate: { path: 'department', model: 'Department' }
      });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update GitHub/Hosted URLs
router.patch('/:id/urls', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (req.body.githubUrl !== undefined) team.githubUrl = req.body.githubUrl;
    if (req.body.hostedUrl !== undefined) team.hostedUrl = req.body.hostedUrl;
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/teams/:id (delete single team)
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Delete all students in this team
    if (team.students && team.students.length > 0) {
      await Student.deleteMany({ _id: { $in: team.students } });
    }

    // Delete the team
    await Team.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams (delete multiple teams)
router.delete('/', async (req, res) => {
  try {
    const { teamIds } = req.body;
    
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({ error: 'Team IDs array is required' });
    }

    // Get all teams to be deleted
    const teams = await Team.find({ _id: { $in: teamIds } });
    
    // Collect all student IDs to delete
    const studentIdsToDelete = [];
    teams.forEach(team => {
      if (team.students && team.students.length > 0) {
        studentIdsToDelete.push(...team.students);
      }
    });

    // Delete all students from these teams
    if (studentIdsToDelete.length > 0) {
      await Student.deleteMany({ _id: { $in: studentIdsToDelete } });
    }

    // Delete all teams
    await Team.deleteMany({ _id: { $in: teamIds } });
    
    res.json({ 
      message: `${teamIds.length} team(s) deleted successfully`,
      deletedCount: teamIds.length,
      studentsDeleted: studentIdsToDelete.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 