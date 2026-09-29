import TopBar from '../components/TopBar';
import Card from '../components/Card';

const steps = [
  {
    title: '1. Download an optimized model from Qualcomm AI Hub',
    body: 'Visit aihub.qualcomm.com and download a Snapdragon-optimized model such as Llama-3-8B, Mistral-7B, or Phi-3-mini compiled for QNN (Qualcomm Neural Network) runtime.',
  },
  {
    title: '2. Install ONNX Runtime with QNN Execution Provider',
    body: 'Run: npm install onnxruntime-node\nThe QNN execution provider routes inference to the Snapdragon NPU/HTP for maximum efficiency and battery savings.',
  },
  {
    title: '3. Implement the qualcommAdapter.js',
    body: 'Open backend/src/services/qualcommAdapter.js — it already contains the integration skeleton. Implement summarize(), generateQuestions(), generateMCQs(), and answerQuestion() using the ONNX session.',
  },
  {
    title: '4. Swap the adapter in index.js',
    body: "In backend/src/index.js, change the import from './services/mockAdapter.js' to './services/qualcommAdapter.js'. No other code changes needed.",
  },
];

const benefits = [
  { icon: '⚡', label: 'NPU Acceleration', desc: 'Snapdragon X Elite NPU delivers up to 45 TOPS for AI inference' },
  { icon: '🔋', label: 'Battery Efficiency', desc: 'On-device inference uses far less power than cloud round-trips' },
  { icon: '🔒', label: 'Privacy', desc: 'Study data never leaves the device — fully offline capable' },
  { icon: '⚡', label: 'Low Latency', desc: 'No network round-trip — responses in milliseconds' },
];

export default function About() {
  return (
    <div className="page">
      <TopBar title="Snapdragon Optimization" />
      <div className="page-content">

        <Card className="snap-hero-card">
          <h2 className="section-title">Snapdragon-Ready Architecture</h2>
          <p className="result-text">
            SnapStudy AI is architected for on-device AI inference on Snapdragon-powered HP PCs.
            The backend uses a clean adapter pattern — the current <strong>mock adapter</strong> is a
            rule-based placeholder. Swapping in a real Qualcomm AI Hub model requires changes
            to <em>one file only</em>.
          </p>
        </Card>

        <h2 className="section-title section-title-standalone">On-Device AI Benefits</h2>
        <div className="benefits-grid">
          {benefits.map(b => (
            <Card key={b.label} className="benefit-card">
              <span className="benefit-icon">{b.icon}</span>
              <strong className="benefit-label">{b.label}</strong>
              <span className="benefit-desc">{b.desc}</span>
            </Card>
          ))}
        </div>

        <h2 className="section-title section-title-standalone">Integration Roadmap</h2>
        {steps.map((s, i) => (
          <Card key={i} className="step-card">
            <strong className="step-title">{s.title}</strong>
            <p className="step-body">{s.body}</p>
          </Card>
        ))}

        <Card>
          <h2 className="section-title">Current Status</h2>
          <table className="status-table">
            <tbody>
              <tr><td>AI Adapter</td><td><span className="chip chip-demo">Mock / Demo</span></td></tr>
              <tr><td>Architecture</td><td><span className="chip chip-snap">Snapdragon-Ready</span></td></tr>
              <tr><td>Qualcomm AI Hub</td><td><span className="chip chip-pending">Pending Integration</span></td></tr>
              <tr><td>ONNX Runtime</td><td><span className="chip chip-pending">Pending Integration</span></td></tr>
              <tr><td>Frontend</td><td><span className="chip chip-ok">React + Vite ✓</span></td></tr>
              <tr><td>Backend</td><td><span className="chip chip-ok">Node.js + Express ✓</span></td></tr>
            </tbody>
          </table>
        </Card>

      </div>
    </div>
  );
}
