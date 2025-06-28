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

function App() {
  return (
    <div className="dark">
      <Router>
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
          </Routes>
        </MainLayout>
      </Router>
    </div>
  );
}

export default App;