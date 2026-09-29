/**
 * AI Service Interface
 * All AI adapters (mock, local ONNX, Qualcomm AI Hub) must implement these methods.
 *
 * To swap in a real model:
 *   1. Create a new file in this folder (e.g. qualcommAdapter.js)
 *   2. Implement the same exported functions
 *   3. Change the import in index.js to point to your new adapter
 */

export function getAdapterName() {
  throw new Error('getAdapterName() not implemented');
}

export async function summarize(text) {
  throw new Error('summarize() not implemented');
}

export async function generateQuestions(text) {
  throw new Error('generateQuestions() not implemented');
}

export async function generateMCQs(text) {
  throw new Error('generateMCQs() not implemented');
}

export async function answerQuestion(context, question) {
  throw new Error('answerQuestion() not implemented');
}
