import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DepartmentStatsChart({ departmentStats }) {
  if (!departmentStats || departmentStats.length === 0) return null;

  const data = {
    labels: departmentStats.map(dept => dept.department),
    datasets: [
      {
        label: 'Teams',
        data: departmentStats.map(dept => dept.teamCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Students',
        data: departmentStats.map(dept => dept.studentCount),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        label: 'Completed Projects',
        data: departmentStats.map(dept => dept.completedProjects),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
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
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Department Statistics</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Teams, students, and completed projects by department
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
} 