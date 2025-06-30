import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD 
    ? '/api'  // In production, use relative path since backend serves frontend
    : 'http://localhost:5000/api', // In development, use localhost:5000
});

// Interview API functions
export const interviewAPI = {
  // Add/edit interview score for a student
  addStudentInterview: (studentId, data) => 
    api.post(`/interviews/student/${studentId}`, data),
  
  // Add/edit interview scores for all students in a team
  addTeamInterview: (teamId, data) => 
    api.post(`/interviews/team/${teamId}`, data),
  
  // Get score report for a student
  getStudentInterview: (studentId) => 
    api.get(`/interviews/student/${studentId}`),
  
  // Get all interview scores of a team
  getTeamInterview: (teamId) => 
    api.get(`/interviews/team/${teamId}`),
  
  // Get department interview scores
  getDepartmentInterview: (departmentId) => 
    api.get(`/interviews/department/${departmentId}`),
  
  // Get overview statistics
  getOverviewStats: () => 
    api.get('/interviews/stats/overview'),
  
  // Get all interview scores for the organization
  getAllInterviews: () => 
    api.get('/interviews/all'),
};

export default api;