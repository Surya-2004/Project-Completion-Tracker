import { Users, Plus, Building2, CheckCircle, XCircle, FolderOpen, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const icons = {
  students: <Users className="w-6 h-6" />,
  teams: <Plus className="w-6 h-6" />,
  departments: <Building2 className="w-6 h-6" />,
  completed: <CheckCircle className="w-6 h-6" />,
  incomplete: <XCircle className="w-6 h-6" />,
  domains: <FolderOpen className="w-6 h-6" />,
  completion: <Target className="w-6 h-6" />,
};

export default function GeneralStatsCards({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      label: "Total Departments",
      value: stats.totalDepartments,
      icon: icons.departments,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: icons.students,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Total Teams",
      value: stats.totalTeams,
      icon: icons.teams,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Project Domains",
      value: stats.totalProjectDomains,
      icon: icons.domains,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Completed Projects",
      value: stats.completedProjects,
      icon: icons.completed,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Incomplete Projects",
      value: stats.incompleteProjects,
      icon: icons.incomplete,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      label: "Completion Rate",
      value: `${stats.completionPercentage}%`,
      icon: icons.completion,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <div className={card.color}>
                  {card.icon}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 