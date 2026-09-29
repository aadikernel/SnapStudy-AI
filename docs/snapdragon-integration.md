# Snapdragon / Qualcomm AI Hub Integration Guide

## Step 1 — Get a Model

Visit https://aihub.qualcomm.com and export one of:
- **Phi-3-mini** (smallest, fastest, good for summarization)
- **Llama-3-8B** (best quality)
- **Mistral-7B** (good balance)

Export format: **ONNX** with **QNN** execution provider target.

## Step 2 — Install ONNX Runtime

```bash
cd backend
npm install onnxruntime-node
```

Place your `.onnx` model file in `backend/models/`.

## Step 3 — Implement qualcommAdapter.js

```js
import * as ort from 'onnxruntime-node';

let session;

export async function init() {
  session = await ort.InferenceSession.create('./models/model.onnx', {
    executionProviders: ['QNN', 'cpu'], // QNN = Snapdragon NPU
  });
}

export function getAdapterName() { return 'qualcomm-ai-hub'; }

export async function summarize(text) {
  // 1. Tokenize text
  // 2. Run session.run(feeds)
  // 3. Decode output tokens
  // Return summary string
}

// Implement generateQuestions, generateMCQs, answerQuestion similarly
```

## Step 4 — Switch the Adapter

In `backend/src/index.js`, change:
```js
// FROM:
import * as ai from './services/mockAdapter.js';
// TO:
import * as ai from './services/qualcommAdapter.js';
```

Call `await ai.init()` before `app.listen(...)`.

## Step 5 — Verify NPU Usage

Use Qualcomm's profiling tools or Windows Task Manager (NPU column on Snapdragon PCs)
to confirm inference is running on the NPU rather than CPU.

## Useful Links

- Qualcomm AI Hub: https://aihub.qualcomm.com
- ONNX Runtime QNN EP: https://onnxruntime.ai/docs/execution-providers/QNN-ExecutionProvider.html
- Snapdragon Dev Kit: https://developer.qualcomm.com
