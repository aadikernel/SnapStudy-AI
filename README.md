# SnapStudy AI — On-Device AI Study Assistant

> Built for the **Qualcomm Snapdragon® AI Lab Build & Present Challenge**

A modern student study assistant designed for **on-device AI inference** on Snapdragon-powered HP PCs.

---

## Features

| Feature | Status |
|---|---|
| Summarize study notes | ✅ Working (Demo adapter) |
| Generate open-ended questions | ✅ Working (Demo adapter) |
| Generate MCQ quizzes | ✅ Working (Demo adapter) |
| Q&A against study material | ✅ Working (Demo adapter) |
| Upload .txt notes file | ✅ Working |
| Study dashboard with stats | ✅ Working |
| Snapdragon / Qualcomm AI Hub integration | 🔲 Architecture ready — model pending |

---

## Quick Start

### 1. Backend
```bash
cd snapstudy-ai/backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### 2. Frontend
```bash
cd snapstudy-ai/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Architecture

```
snapstudy-ai/
├── backend/
│   └── src/
│       ├── index.js              # Express server entry
│       ├── stats.js              # In-memory stats store
│       ├── routes/
│       │   ├── ai.js             # AI endpoints
│       │   └── stats.js          # Stats endpoints
│       └── services/
│           ├── aiInterface.js    # Adapter contract (interface)
│           ├── mockAdapter.js    # ⚠ Demo: rule-based, no real AI
│           └── qualcommAdapter.js # 🔲 Plug in real model here
├── frontend/
│   └── src/
│       ├── api/client.js         # All API calls
│       ├── hooks/useApi.js       # Loading/error state hook
│       ├── components/           # Sidebar, TopBar, Card, Button...
│       └── pages/                # Dashboard, Assistant, Notes, Quiz, QA, About
├── docs/
│   └── snapdragon-integration.md
└── README.md
```

### AI Adapter Pattern

The backend uses a **clean adapter interface**. To swap from demo to real AI:

1. Open `backend/src/services/qualcommAdapter.js`
2. Implement the 4 functions using ONNX Runtime + QNN
3. Change one import line in `backend/src/index.js`

No other code changes needed anywhere.

---

## Snapdragon Optimization Strategy

### Target Hardware
- Snapdragon X Elite / X Plus (HP OmniBook, Spectre, EliteBook)
- Snapdragon NPU: up to 45 TOPS
- Qualcomm AI Hub supported models

### Integration Path
1. **Download model** from [Qualcomm AI Hub](https://aihub.qualcomm.com) — Llama-3, Mistral-7B, or Phi-3-mini (QNN-optimized)
2. **Install** `onnxruntime-node` with QNN execution provider
3. **Implement** `qualcommAdapter.js` (skeleton already provided)
4. **Switch** import in `backend/src/index.js`

### Why On-Device?
- Zero latency (no network round-trip)
- Full privacy (notes never leave the device)
- Works offline
- Battery-efficient via NPU offload

---

## Tech Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Node.js + Express (ESM)
- **AI Layer:** Adapter pattern — mock now, Qualcomm AI Hub ready
- **Styling:** Custom CSS (dark AI dashboard theme)
- **Storage:** sessionStorage (no database required)

---

## Demo Mode Notice

All AI results are currently produced by a **rule-based mock adapter** (`mockAdapter.js`).
This is clearly labeled throughout the UI. The mock adapter is a development placeholder —
it is **not** a real AI model and does not claim to be.


## Backend AI modes

The backend runs immediately in **development mock mode** when no `GEMINI_API_KEY` is configured. This keeps the project runnable without paid API access.

To enable Google Gemini, copy `backend/.env.example` to `backend/.env`, add your API key, and restart the backend. Never commit `.env`.

The API keeps the existing frontend routes (`/ai/summarize`, `/ai/questions`, `/ai/mcqs`, `/ai/answer`, `/ai/upload`) and also provides `/ai/quiz`, `/ai/ask`, and `/ai/analyze` aliases for future integrations.
