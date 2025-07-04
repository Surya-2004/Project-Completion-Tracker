const InterviewScore = require('../models/InterviewScore');
const Student = require('../models/Student');
const Team = require('../models/Team');
const Department = require('../models/Department');

// POST /api/interviews/student/:studentId
async function addOrEditStudentInterview(req, res) {
  try {
    const { studentId } = req.params;
    const { metrics, teamId } = req.body;
    const student = await Student.findOne({ _id: studentId, organization: req.user.organization });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    let interviewScore = await InterviewScore.findOne({ studentId, organization: req.user.organization });
    if (interviewScore) {
      interviewScore.metrics = { ...interviewScore.metrics, ...metrics };
      if (teamId) interviewScore.teamId = teamId;
      await interviewScore.save();
    } else {
      interviewScore = new InterviewScore({ studentId, teamId, metrics, organization: req.user.organization });
      await interviewScore.save();
    }
    await interviewScore.populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    await interviewScore.populate('teamId', 'teamNumber projectTitle');
    res.json(interviewScore);
  } catch (error) {
    console.error('Error adding interview score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/interviews/team/:teamId
async function addOrEditTeamInterview(req, res) {
  try {
    const { teamId } = req.params;
    const { studentScores } = req.body;
    const team = await Team.findOne({ _id: teamId, organization: req.user.organization });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const results = [];
    for (const scoreData of studentScores) {
      const { studentId, metrics } = scoreData;
      const student = await Student.findOne({ _id: studentId, organization: req.user.organization });
      if (!student) {
        results.push({ studentId, error: 'Student not found' });
        continue;
      }
      let interviewScore = await InterviewScore.findOne({ studentId, organization: req.user.organization });
      if (interviewScore) {
        interviewScore.metrics = { ...interviewScore.metrics, ...metrics };
        interviewScore.teamId = teamId;
        await interviewScore.save();
      } else {
        interviewScore = new InterviewScore({ studentId, teamId, metrics, organization: req.user.organization });
        await interviewScore.save();
      }
      await interviewScore.populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
      await interviewScore.populate('teamId', 'teamNumber projectTitle');
      results.push(interviewScore);
    }
    res.json(results);
  } catch (error) {
    console.error('Error adding team interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/interviews/student/:studentId
async function getStudentInterview(req, res) {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ _id: studentId, organization: req.user.organization });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const interviewScore = await InterviewScore.findOne({ studentId, organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    if (!interviewScore) return res.status(404).json({ error: 'No interview score found for this student' });
    res.json(interviewScore);
  } catch (error) {
    console.error('Error getting student interview score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/interviews/team/:teamId
async function getTeamInterview(req, res) {
  try {
    const { teamId } = req.params;
    const team = await Team.findOne({ _id: teamId, organization: req.user.organization });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const interviewScores = await InterviewScore.find({ teamId, organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    const teamStats = { totalStudents: interviewScores.length, averageTotalScore: 0, averageAverageScore: 0, highestScore: 0, lowestScore: Infinity, scores: interviewScores };
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
}

// GET /api/interviews/department/:departmentId
async function getDepartmentInterview(req, res) {
  try {
    const { departmentId } = req.params;
    const department = await Department.findOne({ _id: departmentId, organization: req.user.organization });
    if (!department) return res.status(404).json({ error: 'Department not found' });
    const students = await Student.find({ department: departmentId, organization: req.user.organization });
    const studentIds = students.map(student => student._id);
    const interviewScores = await InterviewScore.find({ studentId: { $in: studentIds }, organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    const departmentStats = { department: department, totalStudents: interviewScores.length, averageTotalScore: 0, averageAverageScore: 0, highestScore: 0, lowestScore: Infinity, scores: interviewScores, metricAverages: {} };
    if (interviewScores.length > 0) {
      const totalScores = interviewScores.map(score => score.totalScore);
      const averageScores = interviewScores.map(score => score.averageScore);
      departmentStats.averageTotalScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100;
      departmentStats.averageAverageScore = Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100;
      departmentStats.highestScore = Math.max(...totalScores);
      departmentStats.lowestScore = Math.min(...totalScores);
      const metrics = ['selfIntro', 'communication', 'confidence', 'dsa', 'problemSolving', 'projectUnderstanding', 'techStack', 'roleExplanation', 'teamwork', 'adaptability'];
      metrics.forEach(metric => {
        const validScores = interviewScores.map(score => score.metrics[metric]).filter(score => score !== null && score !== undefined);
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
}

// GET /api/interviews/stats/overview
async function getOverviewStats(req, res) {
  try {
    const allScores = await InterviewScore.find({ organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    const overview = { totalInterviews: allScores.length, averageTotalScore: 0, averageAverageScore: 0, highestScore: 0, lowestScore: Infinity, topPerformers: [], allInterviews: allScores, departmentStats: {}, metricAverages: {} };
    if (allScores.length > 0) {
      const totalScores = allScores.map(score => score.totalScore);
      const averageScores = allScores.map(score => score.averageScore);
      overview.averageTotalScore = Math.round((totalScores.reduce((a, b) => a + b, 0) / totalScores.length) * 100) / 100;
      overview.averageAverageScore = Math.round((averageScores.reduce((a, b) => a + b, 0) / averageScores.length) * 100) / 100;
      overview.highestScore = Math.max(...totalScores);
      overview.lowestScore = Math.min(...totalScores);
      const sortedScores = allScores.sort((a, b) => b.totalScore - a.totalScore);
      overview.topPerformers = sortedScores.slice(0, 5);
      const metrics = ['selfIntro', 'communication', 'confidence', 'dsa', 'problemSolving', 'projectUnderstanding', 'techStack', 'roleExplanation', 'teamwork', 'adaptability'];
      metrics.forEach(metric => {
        const validScores = allScores.map(score => score.metrics[metric]).filter(score => score !== null && score !== undefined);
        if (validScores.length > 0) {
          overview.metricAverages[metric] = Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 100) / 100;
        } else {
          overview.metricAverages[metric] = 0;
        }
      });
      const departmentMap = {};
      allScores.forEach(score => {
        const deptName = score.studentId.department?.name || 'Unknown';
        if (!departmentMap[deptName]) {
          departmentMap[deptName] = { totalStudents: 0, totalScore: 0, averageScore: 0 };
        }
        departmentMap[deptName].totalStudents++;
        departmentMap[deptName].totalScore += score.totalScore;
        departmentMap[deptName].averageScore += score.averageScore;
      });
      Object.keys(departmentMap).forEach(dept => {
        const deptStats = departmentMap[dept];
        overview.departmentStats[dept] = { totalStudents: deptStats.totalStudents, averageTotalScore: Math.round((deptStats.totalScore / deptStats.totalStudents) * 100) / 100, averageAverageScore: Math.round((deptStats.averageScore / deptStats.totalStudents) * 100) / 100 };
      });
    }
    res.json(overview);
  } catch (error) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/interviews/all
async function getAllInterviews(req, res) {
  try {
    const allScores = await InterviewScore.find({ organization: req.user.organization })
      .populate('teamId', 'teamNumber projectTitle')
      .populate({ path: 'studentId', select: 'name department role email registeredNumber', populate: { path: 'department', select: 'name' } });
    res.json(allScores);
  } catch (error) {
    console.error('Error getting all interview scores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  addOrEditStudentInterview,
  addOrEditTeamInterview,
  getStudentInterview,
  getTeamInterview,
  getDepartmentInterview,
  getOverviewStats,
  getAllInterviews
}; 