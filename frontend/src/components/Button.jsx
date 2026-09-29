export default function Button({ children, loading, onClick, variant = 'primary', disabled, type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className="spinner" /> : null}
      {loading ? 'Processing...' : children}
    </button>
  );
}
