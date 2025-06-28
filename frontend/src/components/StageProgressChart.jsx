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

export default function StageProgressChart({ stageProgress }) {
  if (!stageProgress) return null;

  const data = {
    labels: ['Ideation', 'Work Split', 'Local Project', 'Hosting'],
    datasets: [
      {
        label: 'Teams Completed',
        data: [
          stageProgress.ideation,
          stageProgress.workSplit,
          stageProgress.localProject,
          stageProgress.hosting
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',   // Blue
          'rgba(16, 185, 129, 0.6)',   // Green
          'rgba(245, 158, 11, 0.6)',   // Yellow
          'rgba(239, 68, 68, 0.6)'     // Red
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Teams: ${context.parsed.y}`;
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
            size: 12
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Stage-wise Progress</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Number of teams that have completed each project stage
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