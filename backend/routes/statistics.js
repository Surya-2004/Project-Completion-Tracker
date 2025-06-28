const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Student = require('../models/Student');
const Department = require('../models/Department');

// Get statistics
router.get('/', async (req, res) => {
  try {
    // Total counts
    const [totalStudents, totalTeams, totalDepartments] = await Promise.all([
      Student.countDocuments(),
      Team.countDocuments(),
      Department.countDocuments()
    ]);

    // Completed vs Incomplete projects
    const completedProjects = await Team.countDocuments({ completed: true });
    const incompleteProjects = await Team.countDocuments({ completed: false });

    // Breakdown by domain (number of students per domain)
    const domainAgg = await Team.aggregate([
      { $unwind: '$students' },
      { $group: { _id: '$domain', studentCount: { $sum: 1 } } }
    ]);
    const studentsPerDomain = {};
    domainAgg.forEach(d => {
      studentsPerDomain[d._id] = d.studentCount;
    });

    // Breakdown by department: number of teams and students
    const teamsAgg = await Team.aggregate([
      { $unwind: '$students' },
      { $lookup: {
          from: 'students',
          localField: 'students',
          foreignField: '_id',
          as: 'studentObj'
        }
      },
      { $unwind: '$studentObj' },
      { $group: {
          _id: '$studentObj.department',
          teamCount: { $addToSet: '$_id' },
          studentCount: { $sum: 1 }
        }
      }
    ]);
    // Get department names
    const departments = await Department.find();
    const departmentStats = teamsAgg.map(dep => {
      const dept = departments.find(d => d._id.equals(dep._id));
      return {
        department: dept ? dept.name : 'Unknown',
        teamCount: dep.teamCount.length,
        studentCount: dep.studentCount
      };
    });

    res.json({
      totalStudents,
      totalTeams,
      totalDepartments,
      completedProjects,
      incompleteProjects,
      studentsPerDomain,
      departmentStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/statistics/department-completion
// Returns [{ departmentId, departmentName, completed, notCompleted }]
router.get('/department-completion', async (req, res) => {
  try {
    const departments = await Department.find();
    const teams = await Team.find().populate({
      path: 'students',
      populate: { path: 'department', model: 'Department' }
    });
    // Map: departmentId -> { completed, notCompleted, name }
    const stats = {};
    departments.forEach(dep => {
      stats[dep._id] = { departmentId: dep._id, departmentName: dep.name, completed: 0, notCompleted: 0 };
    });
    teams.forEach(team => {
      // For each department represented in this team
      const depSet = new Set();
      (team.students || []).forEach(stu => {
        let depId = stu.department?._id || stu.department;
        if (depId) depSet.add(depId.toString());
      });
      depSet.forEach(depId => {
        if (stats[depId]) {
          if (team.completed) stats[depId].completed += 1;
          else stats[depId].notCompleted += 1;
        }
      });
    });
    res.json(Object.values(stats));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/statistics/incomplete-teams?department=...  (optional department filter)
// Returns list of not completed teams, sorted by number of checkpoints ticked (desc)
router.get('/incomplete-teams', async (req, res) => {
  try {
    const { department } = req.query;
    let teams = await Team.find({ completed: false })
      .populate({
        path: 'students',
        populate: { path: 'department', model: 'Department' }
      });
    if (department) {
      teams = teams.filter(team =>
        team.students.some(stu => {
          let depId = stu.department?._id || stu.department;
          return depId && depId.toString() === department;
        })
      );
    }
    // Add checkpoint count
    const teamsWithCount = teams.map(team => {
      const checkpoints = team.checkpoints || {};
      const ticked = ['ideation', 'workSplit', 'localProjectDone', 'projectHosted'].filter(k => checkpoints[k]).length;
      return { ...team.toObject(), ticked };
    });
    // Sort by ticked descending
    teamsWithCount.sort((a, b) => b.ticked - a.ticked);
    res.json(teamsWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/statistics/completed-teams?department=...  (optional department filter)
// Returns list of completed teams, sorted by number of checkpoints ticked (desc)
router.get('/completed-teams', async (req, res) => {
  try {
    const { department } = req.query;
    let teams = await Team.find({ completed: true })
      .populate({
        path: 'students',
        populate: { path: 'department', model: 'Department' }
      });
    if (department) {
      teams = teams.filter(team =>
        team.students.some(stu => {
          let depId = stu.department?._id || stu.department;
          return depId && depId.toString() === department;
        })
      );
    }
    // Add checkpoint count
    const teamsWithCount = teams.map(team => {
      const checkpoints = team.checkpoints || {};
      const ticked = ['ideation', 'workSplit', 'localProjectDone', 'projectHosted'].filter(k => checkpoints[k]).length;
      return { ...team.toObject(), ticked };
    });
    // Sort by ticked descending
    teamsWithCount.sort((a, b) => b.ticked - a.ticked);
    res.json(teamsWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 