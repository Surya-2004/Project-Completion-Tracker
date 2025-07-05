const express = require('express');
const router = express.Router();
const InterviewScore = require('../models/InterviewScore');
const Student = require('../models/Student');
const Team = require('../models/Team');
const Department = require('../models/Department');
const { sendInterviewInviteEmail } = require('../utils/emailService');

// POST /api/interviews/student/:studentId - Add/edit interview score for a student
router.post('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { metrics, teamId } = req.body;

    // Validate student exists and belongs to user's organization
    const student = await Student.findOne({ 
      _id: studentId, 
      organization: req.user.organization 
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if interview score already exists for this student
    let interviewScore = await InterviewScore.findOne({ 
      studentId,
      organization: req.user.organization
    });

    if (interviewScore) {
      // Update existing interview score
      interviewScore.metrics = { ...interviewScore.metrics, ...metrics };
      if (teamId) interviewScore.teamId = teamId;
      await interviewScore.save();
    } else {
      // Create new interview score
      interviewScore = new InterviewScore({
        studentId,
        teamId,
        metrics,
        organization: req.user.organization
      });
      await interviewScore.save();
    }

    // Populate student details
    await interviewScore.populate({
      path: 'studentId',
      select: 'name department role',
      populate: {
        path: 'department',
        select: 'name'
      }
    });
    await interviewScore.populate('teamId', 'teamNumber projectTitle');

    res.json(interviewScore);
  } catch (error) {
    console.error('Error adding interview score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/interviews/team/:teamId - Add/edit interview scores for all students in a team
router.post('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { studentScores } = req.body; // Array of { studentId, metrics }

    // Validate team exists and belongs to user's organization
    const team = await Team.findOne({ 
      _id: teamId, 
      organization: req.user.organization 
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const results = [];

    for (const scoreData of studentScores) {
      const { studentId, metrics } = scoreData;

      // Validate student exists and belongs to team and organization
      const student = await Student.findOne({ 
        _id: studentId, 
        organization: req.user.organization 
      });
      if (!student) {
        results.push({ studentId, error: 'Student not found' });
        continue;
      }

      // Check if interview score already exists
      let interviewScore = await InterviewScore.findOne({ 
        studentId,
        organization: req.user.organization
      });

      if (interviewScore) {
        // Update existing interview score
        interviewScore.metrics = { ...interviewScore.metrics, ...metrics };
        interviewScore.teamId = teamId;
        await interviewScore.save();
      } else {
        // Create new interview score
        interviewScore = new InterviewScore({
          studentId,
          teamId,
          metrics,
          organization: req.user.organization
        });
        await interviewScore.save();
      }

      // Populate student details
      await interviewScore.populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });
      await interviewScore.populate('teamId', 'teamNumber projectTitle');

      results.push(interviewScore);
    }

    res.json(results);
  } catch (error) {
    console.error('Error adding team interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/interviews/student/:studentId - Get score report for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate student exists and belongs to user's organization
    const student = await Student.findOne({ 
      _id: studentId, 
      organization: req.user.organization 
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const interviewScore = await InterviewScore.findOne({ 
      studentId,
      organization: req.user.organization
    })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    if (!interviewScore) {
      return res.status(404).json({ error: 'No interview score found for this student' });
    }

    res.json(interviewScore);
  } catch (error) {
    console.error('Error getting student interview score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/interviews/team/:teamId - Get all interview scores of a team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate team exists and belongs to user's organization
    const team = await Team.findOne({ 
      _id: teamId, 
      organization: req.user.organization 
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const interviewScores = await InterviewScore.find({ 
      teamId,
      organization: req.user.organization
    })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    // Calculate team statistics
    const teamStats = {
      totalStudents: interviewScores.length,
      averageTotalScore: 0,
      averageAverageScore: 0,
      highestScore: 0,
      lowestScore: Infinity,
      scores: interviewScores
    };

    if (interviewScores.length > 0) {
      const totalScores = interviewScores.map(score => score.totalScore);
      const averageScores = interviewScores.map(score => score.averageScore);

      teamStats.averageTotalScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100;
      teamStats.averageAverageScore = Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100;
      teamStats.highestScore = Math.max(...totalScores);
      teamStats.lowestScore = Math.min(...totalScores);
    }

    res.json(teamStats);
  } catch (error) {
    console.error('Error getting team interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/interviews/department/:departmentId - Aggregate interview scores per department
router.get('/department/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Validate department exists and belongs to user's organization
    const department = await Department.findOne({ 
      _id: departmentId, 
      organization: req.user.organization 
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Get all students in the department from user's organization
    const students = await Student.find({ 
      department: departmentId,
      organization: req.user.organization
    });
    const studentIds = students.map(student => student._id);

    // Get interview scores for all students in the department
    const interviewScores = await InterviewScore.find({ 
      studentId: { $in: studentIds },
      organization: req.user.organization
    })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    // Calculate department statistics
    const departmentStats = {
      department: department,
      totalStudents: interviewScores.length,
      averageTotalScore: 0,
      averageAverageScore: 0,
      highestScore: 0,
      lowestScore: Infinity,
      scores: interviewScores,
      metricAverages: {}
    };

    if (interviewScores.length > 0) {
      const totalScores = interviewScores.map(score => score.totalScore);
      const averageScores = interviewScores.map(score => score.averageScore);

      departmentStats.averageTotalScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100;
      departmentStats.averageAverageScore = Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100;
      departmentStats.highestScore = Math.max(...totalScores);
      departmentStats.lowestScore = Math.min(...totalScores);

      // Calculate metric averages
      const metrics = ['selfIntro', 'communication', 'confidence', 'dsa', 'problemSolving', 'projectUnderstanding', 'techStack', 'roleExplanation', 'teamwork', 'adaptability'];
      
      metrics.forEach(metric => {
        const validScores = interviewScores
          .map(score => score.metrics[metric])
          .filter(score => score !== null && score !== undefined);
        
        if (validScores.length > 0) {
          departmentStats.metricAverages[metric] = Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 100) / 100;
        } else {
          departmentStats.metricAverages[metric] = 0;
        }
      });
    }

    res.json(departmentStats);
  } catch (error) {
    console.error('Error getting department interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/interviews/stats/overview - Get summary stats
router.get('/stats/overview', async (req, res) => {
  try {
    const allScores = await InterviewScore.find({ organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    const overview = {
      totalInterviews: allScores.length,
      averageTotalScore: 0,
      averageAverageScore: 0,
      highestScore: 0,
      lowestScore: Infinity,
      topPerformers: [],
      allInterviews: allScores,
      departmentStats: {},
      metricAverages: {}
    };

    if (allScores.length > 0) {
      const totalScores = allScores.map(score => score.totalScore);
      const averageScores = allScores.map(score => score.averageScore);

      overview.averageTotalScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100;
      overview.averageAverageScore = Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100;
      overview.highestScore = Math.max(...totalScores);
      overview.lowestScore = Math.min(...totalScores);

      // Get top 5 performers
      const sortedScores = allScores.sort((a, b) => b.totalScore - a.totalScore);
      overview.topPerformers = sortedScores.slice(0, 5);

      // Calculate metric averages
      const metrics = ['selfIntro', 'communication', 'confidence', 'dsa', 'problemSolving', 'projectUnderstanding', 'techStack', 'roleExplanation', 'teamwork', 'adaptability'];
      
      metrics.forEach(metric => {
        const validScores = allScores
          .map(score => score.metrics[metric])
          .filter(score => score !== null && score !== undefined);
        
        if (validScores.length > 0) {
          overview.metricAverages[metric] = Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 100) / 100;
        } else {
          overview.metricAverages[metric] = 0;
        }
      });

      // Calculate department-wise stats
      const departmentMap = {};
      allScores.forEach(score => {
        const deptName = score.studentId.department?.name || 'Unknown';
        if (!departmentMap[deptName]) {
          departmentMap[deptName] = {
            totalStudents: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        departmentMap[deptName].totalStudents++;
        departmentMap[deptName].totalScore += score.totalScore;
        departmentMap[deptName].averageScore += score.averageScore;
      });

      Object.keys(departmentMap).forEach(dept => {
        const deptStats = departmentMap[dept];
        overview.departmentStats[dept] = {
          totalStudents: deptStats.totalStudents,
          averageTotalScore: Math.round((deptStats.totalScore / deptStats.totalStudents) * 100) / 100,
          averageAverageScore: Math.round((deptStats.averageScore / deptStats.totalStudents) * 100) / 100
        };
      });
    }

    res.json(overview);
  } catch (error) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/interviews/all - Get all interview scores for the organization
router.get('/all', async (req, res) => {
  try {
    const allScores = await InterviewScore.find({ organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({
        path: 'studentId',
        select: 'name department role',
        populate: {
          path: 'department',
          select: 'name'
        }
      });

    res.json(allScores);
  } catch (error) {
    console.error('Error getting all interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/interviews/invite/student/:studentId - Send interview invite to a student
router.post('/invite/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { interviewTime, timeOption } = req.body;

    // Validate student exists and belongs to user's organization
    const student = await Student.findOne({ 
      _id: studentId, 
      organization: req.user.organization 
    }).populate('department', 'name');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.email) {
      return res.status(400).json({ error: 'Student does not have an email address' });
    }

    // Calculate interview time based on option
    let calculatedTime;
    if (timeOption === 'minutes') {
      const minutes = parseInt(interviewTime);
      if (isNaN(minutes) || minutes < 0) {
        return res.status(400).json({ error: 'Invalid minutes value' });
      }
      const interviewDate = new Date();
      interviewDate.setMinutes(interviewDate.getMinutes() + minutes);
      calculatedTime = interviewDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } else {
      // Direct time input
      calculatedTime = interviewTime;
    }

    // Send email
    const emailSent = await sendInterviewInviteEmail(
      student.email,
      student.name,
      calculatedTime,
      'Individual'
    );

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send interview invite email' });
    }

    res.json({ 
      success: true, 
      message: 'Interview invite sent successfully',
      interviewTime: calculatedTime,
      student: {
        name: student.name,
        email: student.email,
        department: student.department?.name
      }
    });
  } catch (error) {
    console.error('Error sending interview invite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/interviews/invite/team/:teamId - Send interview invites to all students in a team
router.post('/invite/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { interviewTime, timeOption } = req.body;

    // Validate team exists and belongs to user's organization
    const team = await Team.findOne({ 
      _id: teamId, 
      organization: req.user.organization 
    }).populate({
      path: 'students',
      select: 'name email department',
      populate: {
        path: 'department',
        select: 'name'
      }
    });
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.students || team.students.length === 0) {
      return res.status(400).json({ error: 'Team has no students' });
    }

    // Calculate interview time based on option
    let calculatedTime;
    if (timeOption === 'minutes') {
      const minutes = parseInt(interviewTime);
      if (isNaN(minutes) || minutes < 0) {
        return res.status(400).json({ error: 'Invalid minutes value' });
      }
      const interviewDate = new Date();
      interviewDate.setMinutes(interviewDate.getMinutes() + minutes);
      calculatedTime = interviewDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } else {
      // Direct time input
      calculatedTime = interviewTime;
    }

    // Send emails to all students in the team
    const emailResults = [];
    const studentsWithEmails = team.students.filter(student => student.email);
    const studentsWithoutEmails = team.students.filter(student => !student.email);

    // Prepare team details for email
    const teamDetails = {
      teamNumber: team.teamNumber,
      projectTitle: team.projectTitle,
      domain: team.domain,
      projectDescription: team.projectDescription
    };

    for (const student of studentsWithEmails) {
      const emailSent = await sendInterviewInviteEmail(
        student.email,
        student.name,
        calculatedTime,
        'Team',
        teamDetails
      );
      
      emailResults.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        emailSent,
        department: student.department?.name
      });
    }

    const successCount = emailResults.filter(result => result.emailSent).length;
    const failureCount = emailResults.filter(result => !result.emailSent).length;

    res.json({ 
      success: true, 
      message: `Interview invites sent to ${successCount} students${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      interviewTime: calculatedTime,
      team: {
        teamNumber: team.teamNumber,
        projectTitle: team.projectTitle,
        domain: team.domain
      },
      emailResults,
      studentsWithoutEmails: studentsWithoutEmails.map(student => ({
        name: student.name,
        department: student.department?.name
      }))
    });
  } catch (error) {
    console.error('Error sending team interview invites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 