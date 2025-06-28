const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Student = require('../models/Student');
const Department = require('../models/Department');

// Get comprehensive statistics
router.get('/', async (req, res) => {
  try {
    // Total counts
    const [totalStudents, totalTeams, totalDepartments] = await Promise.all([
      Student.countDocuments(),
      Team.countDocuments(),
      Department.countDocuments()
    ]);

    // Get all teams with populated data
    const teams = await Team.find().populate({
      path: 'students',
      populate: { path: 'department', model: 'Department' }
    });

    // Completed vs Incomplete projects
    const completedProjects = await Team.countDocuments({ completed: true });
    const incompleteProjects = await Team.countDocuments({ completed: false });

    // Calculate completion percentage
    const completionPercentage = totalTeams > 0 ? ((completedProjects / totalTeams) * 100).toFixed(1) : 0;

    // Stage-wise progress count
    const stageProgress = {
      ideation: 0,
      workSplit: 0,
      localProject: 0,
      hosting: 0
    };

    teams.forEach(team => {
      if (team.checkpoints) {
        team.checkpoints.forEach(checkpoint => {
          if (checkpoint.completed) {
            switch (checkpoint.name) {
              case 'Ideation':
                stageProgress.ideation++;
                break;
              case 'Work Split':
                stageProgress.workSplit++;
                break;
              case 'Local Done':
                stageProgress.localProject++;
                break;
              case 'Hosted':
                stageProgress.hosting++;
                break;
            }
          }
        });
      }
    });

    // Get unique project domains
    const uniqueDomains = [...new Set(teams.map(team => team.domain).filter(Boolean))];
    const totalProjectDomains = uniqueDomains.length;

    // Breakdown by domain (number of students per domain)
    const domainAgg = await Team.aggregate([
      { $unwind: '$students' },
      { $group: { _id: '$domain', studentCount: { $sum: 1 } } }
    ]);
    const studentsPerDomain = {};
    domainAgg.forEach(d => {
      studentsPerDomain[d._id] = d.studentCount;
    });

    // Domain completion stats
    const domainCompletionStats = {};
    uniqueDomains.forEach(domain => {
      const domainTeams = teams.filter(team => team.domain === domain);
      const completedDomainTeams = domainTeams.filter(team => team.completed);
      domainCompletionStats[domain] = {
        totalTeams: domainTeams.length,
        completedTeams: completedDomainTeams.length,
        completionRate: domainTeams.length > 0 ? ((completedDomainTeams.length / domainTeams.length) * 100).toFixed(1) : 0
      };
    });

    // Find most popular domain
    const domainTeamCounts = {};
    teams.forEach(team => {
      if (team.domain) {
        domainTeamCounts[team.domain] = (domainTeamCounts[team.domain] || 0) + 1;
      }
    });
    const mostPopularDomain = Object.keys(domainTeamCounts).reduce((a, b) => 
      domainTeamCounts[a] > domainTeamCounts[b] ? a : b, null);

    // Breakdown by department: number of teams, students, and completed projects
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

    // Get department names and calculate completion stats
    const departments = await Department.find();
    const departmentStats = teamsAgg.map(dep => {
      const dept = departments.find(d => d._id.equals(dep._id));
      const deptTeams = teams.filter(team => 
        team.students.some(stu => {
          const depId = stu.department?._id || stu.department;
          return depId && depId.equals(dep._id);
        })
      );
      const completedDeptTeams = deptTeams.filter(team => team.completed);
      const deptDomains = [...new Set(deptTeams.map(team => team.domain).filter(Boolean))];
      
      return {
        department: dept ? dept.name : 'Unknown',
        teamCount: dep.teamCount.length,
        studentCount: dep.studentCount,
        completedProjects: completedDeptTeams.length,
        averageCompletion: deptTeams.length > 0 ? ((completedDeptTeams.length / deptTeams.length) * 100).toFixed(1) : 0,
        domains: deptDomains
      };
    });

    res.json({
      totalStudents,
      totalTeams,
      totalDepartments,
      totalProjectDomains,
      completedProjects,
      incompleteProjects,
      completionPercentage,
      stageProgress,
      studentsPerDomain,
      domainCompletionStats,
      mostPopularDomain,
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
      const checkpoints = team.checkpoints || [];
      const ticked = checkpoints.filter(cp => cp.completed).length;
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
      const checkpoints = team.checkpoints || [];
      const ticked = checkpoints.filter(cp => cp.completed).length;
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