export default function DepartmentStatsTable({ stats }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6">
      <div className="font-bold text-neutral-200 mb-2">Department Breakdown</div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-neutral-800 rounded-xl overflow-hidden shadow">
          <thead>
            <tr className="bg-neutral-800">
              <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Department</th>
              <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Teams</th>
              <th className="px-4 py-2 border border-neutral-800 text-neutral-200">Students</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row, idx) => (
              <tr key={idx} className={`transition hover:bg-neutral-800 ${idx % 2 === 0 ? 'bg-neutral-900' : 'bg-neutral-950'}`}>
                <td className="px-4 py-2 border border-neutral-800 text-white">{row.department}</td>
                <td className="px-4 py-2 border border-neutral-800 text-center text-white">{row.teamCount}</td>
                <td className="px-4 py-2 border border-neutral-800 text-center text-white">{row.studentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 