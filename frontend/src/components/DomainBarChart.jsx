import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6">
      <div className="font-bold text-neutral-200 mb-2">Students per Domain</div>
      <Bar data={chartData} options={options} />
    </div>
  );
} 