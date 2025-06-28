import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CombinedCompletionBarChart({ completed, notCompleted }) {
  const chartData = {
    labels: ['Project Status'],
    datasets: [
      {
        label: 'Completed',
        data: [completed],
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
      },
      {
        label: 'Not Completed',
        data: [notCompleted],
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { 
        labels: { color: '#e5e7eb' },
        position: 'top'
      },
      tooltip: {
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#e5e7eb' },
        grid: { color: '#374151' },
      },
      y: {
        ticks: { color: '#e5e7eb' },
        grid: { color: '#374151' },
      },
    },
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Project Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
} 