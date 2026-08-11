export default function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" data-tone={tone}>{value}</div>
    </div>
  );
}