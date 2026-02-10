export default function RoadmapStats({ roadmaps }) {
  const totalSteps = roadmaps.reduce(
    (sum, r) => sum + r.steps.length,
    0
  );

  const totalEnrolled = roadmaps.reduce(
    (sum, r) => sum + r.enrolledUsers,
    0
  );

  const avgDuration =
    Math.round(
      roadmaps.reduce(
        (sum, r) => sum + parseInt(r.estimatedDuration),
        0
      ) / roadmaps.length
    ) + " weeks";

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Total Roadmaps" value={roadmaps.length} />
      <StatCard title="Total Steps" value={totalSteps} />
      <StatCard
        title="Total Enrolled"
        value={totalEnrolled.toLocaleString()}
      />
      <StatCard title="Avg Duration" value={avgDuration} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
