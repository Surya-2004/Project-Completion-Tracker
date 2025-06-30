const Department = require('../models/Department');
const Student = require('../models/Student');

// Add Department
async function addDepartment(req, res) {
  try {
    const department = new Department({ name: req.body.name, organization: req.user.organization });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// List Departments
async function listDepartments(req, res) {
  try {
    const departments = await Department.find({ organization: req.user.organization });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete Department
async function deleteDepartment(req, res) {
  try {
    const departmentId = req.params.id;
    const department = await Department.findOne({ _id: departmentId, organization: req.user.organization });
    if (!department) return res.status(404).json({ error: 'Department not found' });
    const studentCount = await Student.countDocuments({ department: departmentId, organization: req.user.organization });
    if (studentCount > 0) {
      return res.status(400).json({ error: 'Cannot delete department', message: `This department has ${studentCount} student(s). Please remove all students from this department before deleting it.` });
    }
    await Department.findByIdAndDelete(departmentId);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/departments/team-counts
async function getDepartmentTeamCounts(req, res) {
  try {
    const Team = require('../models/Team');
    const teams = await Team.find({ organization: req.user.organization }).populate('students');
    const counts = {};
    teams.forEach(team => {
      const depSet = new Set();
      (team.students || []).forEach(stu => {
        if (stu.department) depSet.add(stu.department.toString());
      });
      depSet.forEach(depId => {
        counts[depId] = (counts[depId] || 0) + 1;
      });
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addDepartment,
  listDepartments,
  deleteDepartment,
  getDepartmentTeamCounts
}; 