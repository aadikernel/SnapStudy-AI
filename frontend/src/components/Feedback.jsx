export function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-msg">⚠ {message}</div>;
}

export function EmptyState({ message }) {
  return <div className="empty-state">{message}</div>;
}
