export default function TopBar({ title }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">
        <span className="chip chip-demo">⚠ Demo Mode — Mock AI</span>
        <span className="chip chip-snap">⚡ Snapdragon-Ready Architecture</span>
      </div>
    </header>
  );
}
