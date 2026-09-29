/**
 * Optional Google Gemini adapter.
 * Uses the Gemini REST API through Node's built-in fetch.
 *
 * Set GEMINI_API_KEY in backend/.env to enable it.
 * If the key is missing, routes use mockAdapter instead.
 */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function requireKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
}

async function generate(prompt) {
  requireKey();
  const response = await fetch(`${API_URL}?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Gemini request failed (${response.status})`;
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim();

  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export function getAdapterName() {
  return `google-gemini:${MODEL}`;
}

export async function summarize(text) {
  return generate(`Summarize the following study material clearly for a college student. Keep the important facts and concepts. Use concise paragraphs or bullet points. Do not add facts not present in the material.\n\nSTUDY MATERIAL:\n${text}`);
}

export async function generateQuestions(text, count = 5) {
  const raw = await generate(`Create exactly ${count} important study questions from the material below. Return ONLY a JSON array of strings. Do not use markdown fences.\n\nMATERIAL:\n${text}`);
  const parsed = JSON.parse(stripCodeFences(raw));
  if (!Array.isArray(parsed)) throw new Error('Gemini returned an invalid question list.');
  return parsed.slice(0, count).map(String);
}

export async function generateMCQs(text, count = 5) {
  const raw = await generate(`Create exactly ${count} multiple-choice questions from the study material below. Return ONLY a JSON array. Each item must have this shape: {"question":"...","options":["A","B","C","D"],"answer":"one exact option","explanation":"..."} Do not use markdown fences. Do not invent information outside the material.\n\nMATERIAL:\n${text}`);
  const parsed = JSON.parse(stripCodeFences(raw));
  if (!Array.isArray(parsed)) throw new Error('Gemini returned an invalid quiz.');
  return parsed.slice(0, count);
}

export async function answerQuestion(context, question) {
  return generate(`Answer the student's question using ONLY the supplied study material. If the material does not contain enough information, say that clearly. Keep the answer concise and accurate.\n\nSTUDY MATERIAL:\n${context}\n\nQUESTION:\n${question}`);
}

export async function analyze(text) {
  const raw = await generate(`Analyze this study material. Return ONLY valid JSON with keys: keyTopics (array of strings), importantConcepts (array of strings), difficulty (one of "Beginner","Intermediate","Advanced"), suggestedStudyAreas (array of strings). Do not use markdown fences.\n\nMATERIAL:\n${text}`);
  return JSON.parse(stripCodeFences(raw));
}
