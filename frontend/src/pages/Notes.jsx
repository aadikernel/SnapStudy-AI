import { useState } from 'react';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import { ErrorMessage } from '../components/Feedback';
import DemoBanner from '../components/DemoBanner';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';

const STORAGE_KEY = 'snapstudy_notes';

export default function Notes() {
  const [text, setText] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [saved, setSaved] = useState(false);
  const { loading, error, call } = useApi();

  function handleSave() {
    if (text.trim().length < 20) return;
    sessionStorage.setItem(STORAGE_KEY, text);
    call(() => api.trackNote());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const data = await call(() => api.upload(file));
    if (data) {
      setText(data.text);
      sessionStorage.setItem(STORAGE_KEY, data.text);
    }
    e.target.value = '';
  }

  return (
    <div className="page">
      <TopBar title="Notes" />
      <div className="page-content">
        <DemoBanner />
        <ErrorMessage message={error} />
        <Card>
          <div className="card-header-row">
            <h2 className="section-title">Study Material</h2>
            <label className="btn btn-secondary upload-label">
              Upload .txt
              <input type="file" accept=".txt,text/plain" onChange={handleUpload} hidden />
            </label>
          </div>
          <textarea
            className="notes-textarea"
            placeholder="Paste your study notes or textbook content here..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={16}
          />
          <div className="card-footer-row">
            <span className="char-count">{text.length} characters</span>
            <Button loading={loading} onClick={handleSave} disabled={text.trim().length < 20}>
              {saved ? '✓ Saved' : 'Save Notes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
