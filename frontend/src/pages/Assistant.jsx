import { useState } from 'react';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import { ErrorMessage, EmptyState } from '../components/Feedback';
import DemoBanner from '../components/DemoBanner';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const STORAGE_KEY = 'snapstudy_notes';

export default function Assistant() {
  const [text, setText] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [summary, setSummary] = useState(null);
  const [questions, setQuestions] = useState(null);
  const { loading, error, call } = useApi();

  async function handleSummarize() {
    const data = await call(() => api.summarize(text));
    if (data) setSummary(data.summary);
  }

  async function handleQuestions() {
    const data = await call(() => api.questions(text));
    if (data) setQuestions(data.questions);
  }

  const hasText = text.trim().length >= 20;

  return (
    <div className="page">
      <TopBar title="Study Assistant" />
      <div className="page-content">
        <DemoBanner />
        <ErrorMessage message={error} />

        <Card>
          <h2 className="section-title">Study Material</h2>
          <textarea
            className="notes-textarea"
            placeholder="Paste your study notes here, or save them on the Notes page first..."
            value={text}
            onChange={e => { setText(e.target.value); sessionStorage.setItem(STORAGE_KEY, e.target.value); }}
            rows={8}
          />
          <div className="btn-row">
            <Button loading={loading} onClick={handleSummarize} disabled={!hasText}>Summarize</Button>
            <Button loading={loading} onClick={handleQuestions} disabled={!hasText} variant="secondary">Generate Questions</Button>
          </div>
        </Card>

        {summary && (
          <Card>
            <h2 className="section-title">Summary</h2>
            <p className="result-text">{summary}</p>
          </Card>
        )}

        {!summary && !loading && <EmptyState message="Paste study material above and click Summarize or Generate Questions." />}

        {questions && (
          <Card>
            <h2 className="section-title">Generated Questions</h2>
            <ul className="question-list">
              {questions.map((q, i) => <li key={i} className="question-item">{q}</li>)}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
