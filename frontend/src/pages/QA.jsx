import { useState } from 'react';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import { ErrorMessage, EmptyState } from '../components/Feedback';
import DemoBanner from '../components/DemoBanner';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const STORAGE_KEY = 'snapstudy_notes';

export default function QA() {
  const [context] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const { loading, error, call } = useApi();

  async function handleAsk() {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion('');
    const data = await call(() => api.answer(context, q));
    if (data) {
      setHistory(h => [{ q, a: data.answer }, ...h]);
    }
  }

  const hasText = context.trim().length >= 20;

  return (
    <div className="page">
      <TopBar title="Q&A" />
      <div className="page-content">
        <DemoBanner />
        <ErrorMessage message={error} />

        {!hasText ? (
          <EmptyState message="No study material found. Go to the Notes page and save your notes first." />
        ) : (
          <Card>
            <h2 className="section-title">Ask a Question</h2>
            <p className="hint-text">Ask anything about your saved study material.</p>
            <div className="qa-input-row">
              <input
                className="qa-input"
                type="text"
                placeholder="e.g. What is photosynthesis?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk()}
              />
              <Button loading={loading} onClick={handleAsk} disabled={!question.trim()}>Ask</Button>
            </div>
          </Card>
        )}

        {history.length === 0 && hasText && (
          <EmptyState message="Your answers will appear here." />
        )}

        {history.map((item, i) => (
          <Card key={i}>
            <p className="qa-question">Q: {item.q}</p>
            <p className="qa-answer">A: {item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
