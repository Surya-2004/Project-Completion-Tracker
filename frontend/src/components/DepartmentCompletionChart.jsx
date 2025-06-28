import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DepartmentCompletionChart({ departmentStats }) {
  if (!departmentStats || departmentStats.length === 0) return null;

  const data = {
    labels: departmentStats.map(dept => dept.department),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: departmentStats.map(dept => parseFloat(dept.averageCompletion)),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Teams',
        data: departmentStats.map(dept => dept.teamCount),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1',
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
            if (context.dataset.label === 'Completion Rate (%)') {
              return `Completion Rate: ${context.parsed.y}%`;
            }
            return `Teams: ${context.parsed.y}`;
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
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: 'rgba(75, 85, 99, 1)',
          font: {
            weight: '500'
          },
          callback: function(value) {
            return value + '%';
          }
        },
        title: {
          display: true,
          text: 'Completion Rate (%)',
          color: 'rgba(75, 85, 99, 1)',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(75, 85, 99, 1)',
          font: {
            weight: '500'
          }
        },
        title: {
          display: true,
          text: 'Number of Teams',
          color: 'rgba(75, 85, 99, 1)',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
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
          <span>Department Completion Trends</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completion rates and team counts across departments
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
} 