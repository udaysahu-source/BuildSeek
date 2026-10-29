export function DiscoverySkeleton() {
  return (
    <div
      className="sq-departure-board-list sq-skeleton-board"
      role="status"
      aria-label="Loading departure schedule"
    >
      <div className="sq-board-table-header hidden md:grid">
        <span>Departure / Deadline</span>
        <span>Event &amp; Organiser</span>
        <span>Location &amp; Team</span>
        <span>Prize Pool</span>
        <span>Action</span>
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="sq-departure-row sq-departure-skeleton-row">
          <div className="sq-departure-inner">
            <div className="sq-departure-timing">
              <div className="sq-skeleton-pill" style={{ width: "95px", height: "24px" }} />
              <div className="sq-skeleton-text" style={{ width: "120px", height: "20px" }} />
            </div>
            <div className="sq-departure-main">
              <div className="sq-skeleton-text" style={{ width: "70%", height: "22px", marginBottom: "8px" }} />
              <div className="sq-skeleton-text" style={{ width: "40%", height: "14px", marginBottom: "12px" }} />
              <div className="flex gap-4">
                <div className="sq-skeleton-text" style={{ width: "80px", height: "14px" }} />
                <div className="sq-skeleton-text" style={{ width: "90px", height: "14px" }} />
                <div className="sq-skeleton-text" style={{ width: "70px", height: "14px" }} />
              </div>
            </div>
            <div className="sq-departure-actions">
              <div className="sq-skeleton-pill" style={{ width: "74px", height: "36px" }} />
              <div className="sq-skeleton-pill" style={{ width: "90px", height: "36px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
