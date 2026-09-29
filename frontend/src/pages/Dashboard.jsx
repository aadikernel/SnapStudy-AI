import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import { ErrorMessage } from '../components/Feedback';
import { api } from '../api/client';

const statCards = [
  { key: 'notes', label: 'Notes Saved', icon: '✎' },
  { key: 'summaries', label: 'Summaries', icon: '✦' },
  { key: 'questions', label: 'Questions', icon: '?' },
  { key: 'quizzes', label: 'Quizzes', icon: '◈' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  return (
    <div className="page">
      <TopBar title="Dashboard" />
      <div className="page-content">
        <ErrorMessage message={error} />

        <div className="stat-grid">
          {statCards.map(({ key, label, icon }) => (
            <Card key={key} className="stat-card">
              <span className="stat-icon">{icon}</span>
              <span className="stat-value">{stats ? stats[key] : '—'}</span>
              <span className="stat-label">{label}</span>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="section-title">Recent Activity</h2>
          {!stats || stats.activity.length === 0 ? (
            <p className="empty-state">No activity yet. Start by adding notes in the Study Assistant.</p>
          ) : (
            <ul className="activity-list">
              {stats.activity.map((a, i) => (
                <li key={i} className="activity-item">
                  <span className="activity-label">{a.label}</span>
                  <span className="activity-time">{new Date(a.time).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
