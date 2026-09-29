import { useState } from 'react';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import { ErrorMessage, EmptyState } from '../components/Feedback';
import DemoBanner from '../components/DemoBanner';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const STORAGE_KEY = 'snapstudy_notes';

export default function Quiz() {
  const [text] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [mcqs, setMcqs] = useState(null);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { loading, error, call } = useApi();

  async function handleGenerate() {
    setSelected({});
    setSubmitted(false);
    const data = await call(() => api.mcqs(text));
    if (data) setMcqs(data.mcqs);
  }

  function handleSelect(qi, option) {
    if (submitted) return;
    setSelected(s => ({ ...s, [qi]: option }));
  }

  function score() {
    return mcqs.filter((q, i) => selected[i] === q.answer).length;
  }

  const hasText = text.trim().length >= 20;

  return (
    <div className="page">
      <TopBar title="Quiz Generator" />
      <div className="page-content">
        <DemoBanner />
        <ErrorMessage message={error} />

        {!hasText && (
          <EmptyState message="No study material found. Go to the Notes page and save your notes first." />
        )}

        {hasText && (
          <Card>
            <div className="card-header-row">
              <h2 className="section-title">Multiple Choice Quiz</h2>
              <Button loading={loading} onClick={handleGenerate}>Generate MCQs</Button>
            </div>
            <p className="hint-text">Generates questions from your saved study material.</p>
          </Card>
        )}

        {mcqs && (
          <>
            {mcqs.map((q, qi) => (
              <Card key={qi}>
                <p className="question-text">{q.question}</p>
                <div className="options-grid">
                  {q.options.map((opt, oi) => {
                    const isSelected = selected[qi] === opt;
                    const isCorrect = submitted && opt === q.answer;
                    const isWrong = submitted && isSelected && opt !== q.answer;
                    return (
                      <button
                        key={oi}
                        className={`option-btn${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
                        onClick={() => handleSelect(qi, opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="answer-reveal">
                    {selected[qi] === q.answer ? '✓ Correct' : `✗ Correct answer: ${q.answer}`}
                  </p>
                )}
              </Card>
            ))}

            {!submitted ? (
              <Button onClick={() => setSubmitted(true)} disabled={Object.keys(selected).length < mcqs.length}>
                Submit Quiz
              </Button>
            ) : (
              <Card className="score-card">
                <span className="score-text">Score: {score()} / {mcqs.length}</span>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
