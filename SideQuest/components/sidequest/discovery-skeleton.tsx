export function DiscoverySkeleton() {
  return (
    <div className="sq-skeleton-grid" role="status" aria-label="Loading hackathons">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="sq-skeleton-card" />
      ))}
    </div>
  );
}
