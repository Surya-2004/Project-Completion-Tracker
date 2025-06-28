import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Badge } from "@/components/ui/badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DomainStatsChart({ studentsPerDomain, domainCompletionStats, mostPopularDomain }) {
  if (!studentsPerDomain || Object.keys(studentsPerDomain).length === 0) return null;

  const domains = Object.keys(studentsPerDomain);
  const studentCounts = Object.values(studentsPerDomain);

  // Bar chart data for students per domain
  const barData = {
    labels: domains,
    datasets: [
      {
        label: 'Students',
        data: studentCounts,
        backgroundColor: domains.map((_, index) => {
          const colors = [
            'rgba(59, 130, 246, 0.6)',   // Blue
            'rgba(16, 185, 129, 0.6)',   // Green
            'rgba(245, 158, 11, 0.6)',   // Yellow
            'rgba(239, 68, 68, 0.6)',    // Red
            'rgba(139, 92, 246, 0.6)',   // Purple
            'rgba(236, 72, 153, 0.6)',   // Pink
            'rgba(14, 165, 233, 0.6)',   // Sky
            'rgba(34, 197, 94, 0.6)',    // Emerald
          ];
          return colors[index % colors.length];
        }),
        borderColor: domains.map((_, index) => {
          const colors = [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(34, 197, 94, 1)',
          ];
          return colors[index % colors.length];
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Doughnut chart data for domain completion
  const doughnutData = {
    labels: domains,
    datasets: [
      {
        data: domains.map(domain => {
          const stats = domainCompletionStats?.[domain];
          return stats ? stats.totalTeams : 0;
        }),
        backgroundColor: domains.map((_, index) => {
          const colors = [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(14, 165, 233, 0.6)',
            'rgba(34, 197, 94, 0.6)',
          ];
          return colors[index % colors.length];
        }),
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `Students: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          stepSize: 1,
          color: 'rgba(75, 85, 99, 1)',
          font: {
            weight: '500'
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(75, 85, 99, 1)',
          font: {
            weight: '600',
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 11,
            weight: '600'
          },
          color: 'rgba(75, 85, 99, 1)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const domain = context.label;
            const stats = domainCompletionStats?.[domain];
            if (stats) {
              return [
                `Teams: ${stats.totalTeams}`,
                `Completed: ${stats.completedTeams}`,
                `Completion Rate: ${stats.completionRate}%`
              ];
            }
            return `Teams: ${context.parsed}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{domains.length}</div>
              <div className="text-sm text-muted-foreground">Total Domains</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{studentCounts.reduce((a, b) => a + b, 0)}</div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mostPopularDomain || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">Most Popular Domain</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students per Domain</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of students across different project domains
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain Completion Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Teams and completion rates by domain
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domain Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Completion Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Domain</th>
                  <th className="text-left p-2 font-medium">Students</th>
                  <th className="text-left p-2 font-medium">Teams</th>
                  <th className="text-left p-2 font-medium">Completed</th>
                  <th className="text-left p-2 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  const stats = domainCompletionStats?.[domain];
                  const isPopular = domain === mostPopularDomain;
                  return (
                    <tr key={domain} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {domain}
                          {isPopular && (
                            <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2">{studentsPerDomain[domain]}</td>
                      <td className="p-2">{stats?.totalTeams || 0}</td>
                      <td className="p-2">{stats?.completedTeams || 0}</td>
                      <td className="p-2">
                        <span className={`font-medium ${
                          stats?.completionRate >= 80 ? 'text-green-600' :
                          stats?.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {stats?.completionRate || 0}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 