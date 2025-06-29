import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AddDepartment from './pages/AddDepartment';
import AddTeam from './pages/AddTeam';
import TeamList from './pages/TeamList';
import TeamDetail from './pages/TeamDetail';
import Statistics from './pages/Statistics';
import MainLayout from './components/MainLayout';
import StudentList from './pages/StudentList';
import NotCompletedTeams from './pages/NotCompletedTeams';
import CompletedTeams from './pages/CompletedTeams';
import InterviewDashboard from './pages/InterviewDashboard';
import StudentInterviewForm from './pages/StudentInterviewForm';
import TeamInterviewForm from './pages/TeamInterviewForm';
import InterviewStatistics from './pages/InterviewStatistics';
import StudentInterviewView from './pages/StudentInterviewView';
import TeamInterviewView from './pages/TeamInterviewView';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/teams" />} />
                      <Route path="/departments" element={<AddDepartment />} />
                      <Route path="/departments/add" element={<AddDepartment />} />
                      <Route path="/departments/:id/students" element={<StudentList />} />
                      <Route path="/teams/add" element={<AddTeam />} />
                      <Route path="/teams" element={<TeamList />} />
                      <Route path="/teams/:id" element={<TeamDetail />} />
                      <Route path="/teams/incomplete" element={<NotCompletedTeams />} />
                      <Route path="/teams/completed" element={<CompletedTeams />} />
                      <Route path="/statistics" element={<Statistics />} />
                      {/* Interview Routes with Error Boundaries */}
                      <Route path="/interviews" element={<ErrorBoundary><InterviewDashboard /></ErrorBoundary>} />
                      <Route path="/interviews/student/:studentId" element={<ErrorBoundary><StudentInterviewForm /></ErrorBoundary>} />
                      <Route path="/interviews/student/:studentId/view" element={<ErrorBoundary><StudentInterviewView /></ErrorBoundary>} />
                      <Route path="/interviews/team/:teamId" element={<ErrorBoundary><TeamInterviewForm /></ErrorBoundary>} />
                      <Route path="/interviews/team/:teamId/view" element={<ErrorBoundary><TeamInterviewView /></ErrorBoundary>} />
                      <Route path="/interviews/statistics" element={<ErrorBoundary><InterviewStatistics /></ErrorBoundary>} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;