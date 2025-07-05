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
      Student.countDocuments({ organization: req.user.organization }),
      Team.countDocuments({ organization: req.user.organization }),
      Department.countDocuments({ organization: req.user.organization })
    ]);

    // Get all teams with populated data
    const teams = await Team.find({ organization: req.user.organization }).populate({
      path: 'students',
      populate: { path: 'department', model: 'Department' }
    });

    // Completed vs Incomplete projects
    const completedProjects = await Team.countDocuments({ 
      completed: true, 
      organization: req.user.organization 
    });
    const incompleteProjects = await Team.countDocuments({ 
      completed: false, 
      organization: req.user.organization 
    });

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
      { $match: { organization: req.user.organization } },
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
    // Fixed to handle teams with mixed departments correctly
    const departments = await Department.find({ organization: req.user.organization });
    const departmentStats = [];

    for (const dept of departments) {
      // Get all teams that have at least one student from this department
      const deptTeams = teams.filter(team => 
        team.students.some(stu => {
          const depId = stu.department?._id || stu.department;
          return depId && depId.equals(dept._id);
        })
      );

      // Count students from this department across all teams
      let studentCount = 0;
      teams.forEach(team => {
        team.students.forEach(stu => {
          const depId = stu.department?._id || stu.department;
          if (depId && depId.equals(dept._id)) {
            studentCount++;
          }
        });
      });

      // Count completed projects for this department
      const completedDeptTeams = deptTeams.filter(team => team.completed);
      
      // Get unique domains for this department
      const deptDomains = [...new Set(deptTeams.map(team => team.domain).filter(Boolean))];
      
      departmentStats.push({
        department: dept.name,
        teamCount: deptTeams.length, // Each team counted only once per department
        studentCount: studentCount,
        completedProjects: completedDeptTeams.length,
        averageCompletion: deptTeams.length > 0 ? ((completedDeptTeams.length / deptTeams.length) * 100).toFixed(1) : 0,
        domains: deptDomains
      });
    }

    // Calculate accurate totals for department breakdown (without double-counting)
    // Simply use the actual total counts since these are already correct
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
      departmentStats,
      departmentBreakdownTotals: {
        totalTeamsAcrossDepartments: totalTeams,
        totalStudentsAcrossDepartments: totalStudents,
        totalCompletedProjectsAcrossDepartments: completedProjects
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/statistics/department-completion
// Returns [{ departmentId, departmentName, completed, notCompleted }]
router.get('/department-completion', async (req, res) => {
  try {
    const departments = await Department.find({ organization: req.user.organization });
    const teams = await Team.find({ organization: req.user.organization }).populate({
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
    let teams = await Team.find({ 
      completed: false, 
      organization: req.user.organization 
    })
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
    let teams = await Team.find({ 
      completed: true, 
      organization: req.user.organization 
    })
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