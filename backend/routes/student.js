const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Team = require('../models/Team');
const InterviewScore = require('../models/InterviewScore');

// POST /api/students (create new student)
router.post('/', async (req, res) => {
  try {
    const { name, department, role, resumeUrl, registeredNumber } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Student name is required' });
    }
    
    if (!department) {
      return res.status(400).json({ error: 'Department is required' });
    }
    
    // Create new student
    const student = new Student({
      name: name.trim(),
      department,
      role: role || '',
      resumeUrl: resumeUrl || '',
      registeredNumber: registeredNumber || '',
      organization: req.user.organization
    });
    
    await student.save();
    
    // Populate department and team info for response
    await student.populate([
      {
        path: 'department',
        model: 'Department',
        select: 'name'
      },
      {
        path: 'teamId',
        select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl'
      }
    ]);
    
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error (likely registeredNumber)
      return res.status(400).json({ error: 'A student with this registered number already exists' });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /api/students?department=...&search=...  (list students with search and department filter)
router.get('/', async (req, res) => {
  try {
    const { department, search } = req.query;
    const filter = { organization: req.user.organization };
    
    if (department) filter.department = department;
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      filter.$or = [
        { name: searchRegex },
        { registeredNumber: searchRegex }
      ];
    }
    
    const students = await Student.find(filter)
      .populate({
        path: 'department',
        model: 'Department',
        select: 'name'
      })
      .populate({
        path: 'teamId',
        select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl'
      })
      .sort({ registeredNumber: 1, name: 1 }); // Sort by registeredNumber first, then name
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/department/:departmentId (get students by department)
router.get('/department/:departmentId', async (req, res) => {
  try {
    const students = await Student.find({ 
      department: req.params.departmentId,
      organization: req.user.organization 
    })
      .populate({
        path: 'department',
        model: 'Department',
        select: 'name'
      })
      .populate({
        path: 'teamId',
        select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl'
      })
      .sort({ registeredNumber: 1, name: 1 }); // Sort by registeredNumber first, then name
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id (get single student)
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ 
      _id: req.params.id, 
      organization: req.user.organization 
    })
      .populate({
        path: 'department',
        model: 'Department',
        select: 'name'
      })
      .populate({
        path: 'teamId',
        select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl'
      });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/students/:id (update student fields)
router.patch('/:id', async (req, res) => {
  try {
    const { resumeUrl, role, registeredNumber } = req.body;
    const updateData = {};
    
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (role !== undefined) updateData.role = role;
    if (registeredNumber !== undefined) updateData.registeredNumber = registeredNumber;
    
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      updateData,
      { new: true }
    ).populate({
      path: 'department',
      model: 'Department',
      select: 'name'
    }).populate({
      path: 'teamId',
      select: 'teamNumber projectTitle projectDescription domain completed githubUrl hostedUrl'
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
    const student = await Student.findOne({ 
      _id: req.params.id, 
      organization: req.user.organization 
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete interview scores for this student
    await InterviewScore.deleteMany({ 
      studentId: student._id,
      organization: req.user.organization
    });

    // Remove student from team
    if (student.teamId) {
      const team = await Team.findOne({ 
        _id: student.teamId, 
        organization: req.user.organization 
      });
      if (team) {
        team.students = team.students.filter(s => s.toString() !== student._id.toString());
        
        // If team has no students left, delete the team and its interview scores
        if (team.students.length === 0) {
          // Delete all interview scores for this team
          await InterviewScore.deleteMany({ 
            teamId: team._id,
            organization: req.user.organization
          });
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

    // Get all students to be deleted (only from user's organization)
    const students = await Student.find({ 
      _id: { $in: studentIds },
      organization: req.user.organization
    });
    
    // Delete interview scores for all these students
    await InterviewScore.deleteMany({ 
      studentId: { $in: studentIds },
      organization: req.user.organization
    });
    
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
      const team = await Team.findOne({ 
        _id: teamId, 
        organization: req.user.organization 
      });
      if (team) {
        team.students = team.students.filter(s => 
          !studentIdsToRemove.some(id => id.toString() === s.toString())
        );
        
        // If team has no students left, delete it and its interview scores
        if (team.students.length === 0) {
          // Delete all interview scores for this team
          await InterviewScore.deleteMany({ 
            teamId: teamId,
            organization: req.user.organization
          });
          await Team.findByIdAndDelete(teamId);
        } else {
          await team.save();
        }
      }
    }

    // Delete all students
    await Student.deleteMany({ 
      _id: { $in: studentIds },
      organization: req.user.organization
    });
    
    res.json({ 
      message: `${students.length} student(s) deleted successfully`,
      deletedCount: students.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 