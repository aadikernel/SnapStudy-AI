import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/assistant', label: 'Study Assistant', icon: '✦' },
  { to: '/notes', label: 'Notes', icon: '✎' },
  { to: '/quiz', label: 'Quiz Generator', icon: '◈' },
  { to: '/qa', label: 'Q&A', icon: '?' },
  { to: '/about', label: 'Snapdragon Info', icon: '⚡' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">SnapStudy AI</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="demo-badge">DEMO MODE</span>
        <span className="demo-label">Mock AI Adapter</span>
      </div>
    </aside>
  );
}
