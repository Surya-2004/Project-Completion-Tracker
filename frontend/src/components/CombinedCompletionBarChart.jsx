import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function CombinedCompletionBarChart({ completed, notCompleted }) {
  const chartData = {
    labels: ['Completed', 'Not Completed'],
    datasets: [
      {
        label: 'Projects',
        data: [completed, notCompleted],
        backgroundColor: [
          'rgba(34,197,94,0.7)', // green-500
          'rgba(239,68,68,0.7)', // red-500
        ],
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
      },
    },
  };
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6">
      <div className="font-bold text-neutral-200 mb-2">Overall Project Completion</div>
      <Bar data={chartData} options={options} />
    </div>
  );
} 