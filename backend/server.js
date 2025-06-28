require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const departmentRoutes = require('./routes/department');
const teamRoutes = require('./routes/team');
const statisticsRoutes = require('./routes/statistics');
const studentRoutes = require('./routes/student');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/students', studentRoutes);

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