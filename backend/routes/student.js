const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Team = require('../models/Team');

// GET /api/students?department=...  (list students by department)
router.get('/', async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const students = await Student.find(filter)
      .populate({
        path: 'teamId',
        select: 'teamNumber projectTitle'
      });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/students/:id (update resumeUrl)
router.patch('/:id', async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { resumeUrl },
      { new: true }
    ).populate({
      path: 'teamId',
      select: 'teamNumber projectTitle'
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/students/:id (delete single student)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Remove student from team
    if (student.teamId) {
      const team = await Team.findById(student.teamId);
      if (team) {
        team.students = team.students.filter(s => s.toString() !== student._id.toString());
        
        // If team has no students left, delete the team
        if (team.students.length === 0) {
          await Team.findByIdAndDelete(team._id);
        } else {
          await team.save();
        }
      }
    }

    // Delete the student
    await Student.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students (delete multiple students)
router.delete('/', async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    // Get all students to be deleted
    const students = await Student.find({ _id: { $in: studentIds } });
    
    // Group students by team for efficient processing
    const teamStudents = {};
    students.forEach(student => {
      if (student.teamId) {
        if (!teamStudents[student.teamId]) {
          teamStudents[student.teamId] = [];
        }
        teamStudents[student.teamId].push(student._id);
      }
    });

    // Update teams and delete empty ones
    for (const [teamId, studentIdsToRemove] of Object.entries(teamStudents)) {
      const team = await Team.findById(teamId);
      if (team) {
        team.students = team.students.filter(s => 
          !studentIdsToRemove.some(id => id.toString() === s.toString())
        );
        
        // If team has no students left, delete it
        if (team.students.length === 0) {
          await Team.findByIdAndDelete(teamId);
        } else {
          await team.save();
        }
      }
    }

    // Delete all students
    await Student.deleteMany({ _id: { $in: studentIds } });
    
    res.json({ 
      message: `${studentIds.length} student(s) deleted successfully`,
      deletedCount: studentIds.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 