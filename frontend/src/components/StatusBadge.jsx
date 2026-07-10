const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status}`}>{status}</span>
);

export default StatusBadge;