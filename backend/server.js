require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/department');
const teamRoutes = require('./routes/team');
const statisticsRoutes = require('./routes/statistics');
const studentRoutes = require('./routes/student');
const interviewRoutes = require('./routes/interview');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected API routes (authentication required)
app.use('/api/departments', auth, departmentRoutes);
app.use('/api/teams', auth, teamRoutes);
app.use('/api/statistics', auth, statisticsRoutes);
app.use('/api/students', auth, studentRoutes);
app.use('/api/interviews', auth, interviewRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});