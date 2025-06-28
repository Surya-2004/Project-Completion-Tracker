import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DepartmentCompletionBarChart({ data }) {
  const chartData = {
    labels: data.map(d => d.department),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: data.map(d => d.completionRate),
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
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
        max: 100,
      },
    },
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Completion Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
} 