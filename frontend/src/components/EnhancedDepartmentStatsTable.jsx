import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function EnhancedDepartmentStatsTable({ departmentStats, totals }) {
  if (!departmentStats || departmentStats.length === 0) return null;

  // Use accurate totals if provided, otherwise calculate from department stats
  const totalTeams = totals?.totalTeamsAcrossDepartments || departmentStats.reduce((sum, dept) => sum + dept.teamCount, 0);
  const totalStudents = totals?.totalStudentsAcrossDepartments || departmentStats.reduce((sum, dept) => sum + dept.studentCount, 0);
  const totalCompletedProjects = totals?.totalCompletedProjectsAcrossDepartments || departmentStats.reduce((sum, dept) => sum + dept.completedProjects, 0);
  const totalDepartments = departmentStats.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Department Breakdown</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed statistics for each department including teams, students, and completion rates
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Department</th>
                <th className="text-left p-3 font-medium">Teams</th>
                <th className="text-left p-3 font-medium">Students</th>
                <th className="text-left p-3 font-medium">Completed Projects</th>
                <th className="text-left p-3 font-medium">Completion Rate</th>
                <th className="text-left p-3 font-medium">Domains</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => {
                const completionRate = parseFloat(dept.averageCompletion);
                const progressColor = completionRate >= 80 ? 'bg-green-500' :
                                    completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500';
                
                return (
                  <tr key={dept.department} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium">{dept.department}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">{dept.teamCount}</span>
                        <span className="text-sm text-muted-foreground">teams</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">{dept.studentCount}</span>
                        <span className="text-sm text-muted-foreground">students</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600">{dept.completedProjects}</span>
                        <span className="text-sm text-muted-foreground">completed</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${
                            completionRate >= 80 ? 'text-green-600' :
                            completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {completionRate}%
                          </span>
                        </div>
                        <Progress 
                          value={completionRate} 
                          className="h-2 w-24"
                          indicatorClassName={progressColor}
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {dept.domains && dept.domains.length > 0 ? (
                          dept.domains.slice(0, 3).map((domain, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {domain}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No domains</span>
                        )}
                        {dept.domains && dept.domains.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dept.domains.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalTeams}
            </div>
            <div className="text-sm text-muted-foreground">Total Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalStudents}
            </div>
            <div className="text-sm text-muted-foreground">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {totalCompletedProjects}
            </div>
            <div className="text-sm text-muted-foreground">Completed Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalDepartments}
            </div>
            <div className="text-sm text-muted-foreground">Departments</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 