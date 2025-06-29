# Project Completion Tracker

A comprehensive MERN stack admin dashboard for tracking student group project completion and conducting interviews.

## Features

### Core Project Management
- **Department Management**: Create and manage academic departments
- **Student Management**: Add students to departments with roles and team assignments
- **Team Management**: Create teams, assign projects, and track completion status
- **Project Tracking**: Monitor project progress through checkpoints (Ideation, Work Split, Local Done, Hosted)
- **Statistics Dashboard**: Comprehensive analytics and reporting

### 🆕 Interview Module
- **Student Interviews**: Conduct individual student interviews with detailed metrics
- **Team Interviews**: Interview entire teams at once with individual student scoring
- **Interview Statistics**: Comprehensive analysis of interview performance
- **Performance Tracking**: Track interview scores across departments and teams

## Interview Metrics

The interview system evaluates students across 10 key metrics (all optional, scored 1-10):

1. **Self Introduction** - How well the student introduces themselves
2. **Communication Skills** - Clarity and effectiveness of communication
3. **Confidence Level** - Student's confidence during the interview
4. **DSA Knowledge** - Understanding of Data Structures and Algorithms
5. **Problem Solving** - Ability to approach and solve problems
6. **Project Understanding** - Understanding of their project
7. **Tech Stack Knowledge** - Knowledge of technologies used
8. **Role Explanation** - How well they explain their role
9. **Teamwork** - Understanding of teamwork and collaboration
10. **Adaptability** - Ability to adapt to new situations

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **RESTful API** architecture

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons
- **Chart.js** for data visualization
- **React Router** for navigation

## API Endpoints

### Core Endpoints
- `GET/POST /api/departments` - Department management
- `GET/POST /api/students` - Student management
- `GET/POST /api/teams` - Team management
- `GET /api/statistics` - Project statistics

### 🆕 Interview Endpoints
- `POST /api/interviews/student/:studentId` - Add/edit student interview
- `POST /api/interviews/team/:teamId` - Add/edit team interviews
- `GET /api/interviews/student/:studentId` - Get student interview results
- `GET /api/interviews/team/:teamId` - Get team interview results
- `GET /api/interviews/department/:departmentId` - Get department interview stats
- `GET /api/interviews/stats/overview` - Get overall interview statistics

## Database Schema

### InterviewScore Collection
```javascript
{
  studentId: ObjectId,      // Reference to Student
  teamId: ObjectId,         // Reference to Team (optional)
  metrics: {
    selfIntro: Number,      // 1-10
    communication: Number,  // 1-10
    confidence: Number,     // 1-10
    dsa: Number,           // 1-10
    problemSolving: Number, // 1-10
    projectUnderstanding: Number, // 1-10
    techStack: Number,     // 1-10
    roleExplanation: Number, // 1-10
    teamwork: Number,      // 1-10
    adaptability: Number   // 1-10
  },
  totalScore: Number,       // Auto-calculated
  averageScore: Number,     // Auto-calculated
  createdAt: Date,
  updatedAt: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## Usage

### Interview Workflow

1. **Access Interview Dashboard**
   - Navigate to "Interviews" in the main navigation
   - Choose between "Interview Students" or "Interview Teams" tabs

2. **Conduct Student Interview**
   - Search and select a student
   - Fill in interview metrics (all fields optional)
   - Scores are auto-calculated
   - Save interview results

3. **Conduct Team Interview**
   - Select a team to interview all members
   - Fill in metrics for each student
   - View team statistics and individual scores
   - Save all interviews at once

4. **View Interview Statistics**
   - Access comprehensive analytics
   - View performance by student, team, or department
   - Compare scores and identify top performers

### Key Features

- **Flexible Scoring**: All interview metrics are optional
- **Auto-calculation**: Total and average scores calculated automatically
- **Real-time Updates**: Immediate feedback on score changes
- **Comprehensive Analytics**: Detailed statistics and performance analysis
- **Team Comparison**: Compare individual performance within teams
- **Department Analysis**: Track performance across departments

## Project Structure

```
Project-Completion-Tracker/
├── backend/
│   ├── models/
│   │   ├── Department.js
│   │   ├── Student.js
│   │   ├── Team.js
│   │   └── InterviewScore.js          # 🆕 Interview model
│   ├── routes/
│   │   ├── department.js
│   │   ├── student.js
│   │   ├── team.js
│   │   ├── statistics.js
│   │   └── interview.js               # 🆕 Interview routes
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── InterviewDashboard.jsx     # 🆕 Main interview page
│   │   │   ├── StudentInterviewForm.jsx   # 🆕 Student interview form
│   │   │   ├── TeamInterviewForm.jsx      # 🆕 Team interview form
│   │   │   ├── InterviewStatistics.jsx    # 🆕 Interview analytics
│   │   │   ├── StudentInterviewView.jsx   # 🆕 View student results
│   │   │   └── TeamInterviewView.jsx      # 🆕 View team results
│   │   ├── services/
│   │   │   └── api.js                      # 🆕 Updated with interview API
│   │   └── components/
│   │       └── ui/                         # 🆕 Additional UI components
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



## Support

For support or questions, please open an issue in the repository.
