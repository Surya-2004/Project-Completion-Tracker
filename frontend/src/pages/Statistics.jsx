import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataManager } from '../hooks/useDataManager';

// Import new statistical components
import GeneralStatsCards from '../components/GeneralStatsCards';
import StageProgressChart from '../components/StageProgressChart';
import ProjectCompletionPieChart from '../components/ProjectCompletionPieChart';
import DepartmentStatsChart from '../components/DepartmentStatsChart';
import DepartmentCompletionChart from '../components/DepartmentCompletionChart';
import DomainStatsChart from '../components/DomainStatsChart';
import EnhancedDepartmentStatsTable from '../components/EnhancedDepartmentStatsTable';
import DownloadPDFButton from '../components/DownloadPDFButton';

export default function Statistics() {
  const navigate = useNavigate();

  // Use data manager for statistics with force refresh on navigation
  const { 
    data: stats, 
    loading, 
    error 
  } = useDataManager('/statistics', {
    forceRefresh: true, // Force refresh when navigating to this page
    cacheKey: 'statistics'
  });

  if (loading) return (
    <Card className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <CardContent>
        <p className="text-muted-foreground">Loading statistics...</p>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <CardContent>
        <p className="text-destructive font-medium">{error}</p>
      </CardContent>
    </Card>
  );
  
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">📊 Project Statistics Dashboard</CardTitle>
              <p className="text-muted-foreground">
                Comprehensive insights into team progress, department performance, and project completion rates
              </p>
            </div>
            <DownloadPDFButton />
          </div>
        </CardHeader>
      </Card>
      
      {/* General Statistics Cards */}
      <GeneralStatsCards stats={stats} />

      {/* Project Completion Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ProjectCompletionPieChart 
          completedProjects={stats.completedProjects}
          incompleteProjects={stats.incompleteProjects}
        />
        <StageProgressChart stageProgress={stats.stageProgress} />
      </div>

      {/* Department Statistics */}
      <div className="space-y-4 sm:space-y-6">
        <DepartmentStatsChart departmentStats={stats.departmentStats} />
        <DepartmentCompletionChart departmentStats={stats.departmentStats} />
      </div>

      {/* Domain Statistics */}
      <DomainStatsChart 
        studentsPerDomain={stats.studentsPerDomain}
        domainCompletionStats={stats.domainCompletionStats}
        mostPopularDomain={stats.mostPopularDomain}
      />

      {/* Enhanced Department Stats Table */}
      <EnhancedDepartmentStatsTable departmentStats={stats.departmentStats} />

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/teams/incomplete')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-600">Incomplete Projects</h3>
                <p className="text-2xl font-bold text-red-600">{stats.incompleteProjects}</p>
                <p className="text-sm text-muted-foreground">View teams that need attention</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/teams/completed')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-600">Completed Projects</h3>
                <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                <p className="text-sm text-muted-foreground">View successful teams</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
