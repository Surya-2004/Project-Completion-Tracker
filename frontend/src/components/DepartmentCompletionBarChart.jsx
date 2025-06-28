import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DepartmentCompletionBarChart({ data }) {
  const chartData = {
    labels: data.map(d => d.departmentName),
    datasets: [
      {
        label: 'Completed',
        data: data.map(d => d.completed),
        backgroundColor: 'rgba(34,197,94,0.7)', // green-500
      },
      {
        label: 'Not Completed',
        data: data.map(d => d.notCompleted),
        backgroundColor: 'rgba(239,68,68,0.7)', // red-500
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e5e7eb' } },
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
      <div className="font-bold text-neutral-200 mb-2">Department-wise Project Completion</div>
      <Bar data={chartData} options={options} />
    </div>
  );
} 