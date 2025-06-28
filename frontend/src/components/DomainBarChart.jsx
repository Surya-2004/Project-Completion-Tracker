import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DomainBarChart({ data }) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Students',
        data: Object.values(data),
        backgroundColor: 'rgba(163, 163, 163, 0.7)', // neutral-400
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
        ticks: { color: '#e5e7eb' }, // neutral-200
        grid: { color: '#374151' }, // neutral-700
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
        <CardTitle>Students per Domain</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
} 