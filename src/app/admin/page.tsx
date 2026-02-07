export default function AdminDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
        <p className="mb-6">Welcome, admin! Here you can manage players, games, and leaderboard data.</p>
        <ul className="mb-4">
          <li className="mb-2"><span className="text-gray-500">Players management (coming soon)</span></li>
          <li className="mb-2"><span className="text-gray-500">Games management (coming soon)</span></li>
          <li className="mb-2"><span className="text-gray-500">Leaderboard management (coming soon)</span></li>
        </ul>
        <p className="text-sm text-gray-400">More admin features will be added as development continues.</p>
      </div>
    </div>
  );
}
