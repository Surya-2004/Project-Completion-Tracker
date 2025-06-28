import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export default function ProjectCompletionPieChart({ completedProjects, incompleteProjects }) {
  if (completedProjects === undefined || incompleteProjects === undefined) return null;

  const data = {
    labels: ['Completed', 'Incomplete'],
    datasets: [
      {
        data: [completedProjects, incompleteProjects],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',   // Green
          'rgba(239, 68, 68, 0.7)'     // Red
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 13,
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
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const total = completedProjects + incompleteProjects;
  const completionRate = total > 0 ? ((completedProjects / total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Project Completion Overview</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Overall completion rate: {completionRate}%
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Pie data={data} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{incompleteProjects}</div>
            <div className="text-sm text-red-700">Incomplete</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 