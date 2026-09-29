/**
 * Rule-based development adapter.
 * This is NOT a real AI model. It keeps the app runnable without an API key.
 */

export function getAdapterName() { return 'mock-demo'; }

function sentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map(s => s.trim()).filter(Boolean);
}

function words(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
}

function topKeywords(text, limit = 8) {
  const stop = new Set(['this','that','with','from','which','there','their','about','these','those','have','has','into','also','than','they','them','were','will','been','being','what','when','where','while','using','used','such','more','most','some','only']);
  const counts = new Map();
  for (const w of words(text)) if (!stop.has(w)) counts.set(w, (counts.get(w) || 0) + 1);
  return [...counts.entries()].sort((a,b) => b[1]-a[1]).slice(0,limit).map(([w]) => w);
}

export async function summarize(text) {
  const s = sentences(text);
  if (s.length <= 3) return s.join(' ');
  return s.slice(0, Math.min(4, Math.ceil(s.length / 2))).join(' ');
}

export async function generateQuestions(text, count = 5) {
  const s = sentences(text);
  const n = Math.max(1, Math.min(Number(count) || 5, 10));
  return Array.from({length:n}, (_,i) => {
    const source = s[i % s.length].replace(/[.!?]+$/, '');
    return `What is the main idea or importance of: "${source.slice(0, 100)}${source.length > 100 ? '...' : ''}"?`;
  });
}

export async function generateMCQs(text, count = 5) {
  const s = sentences(text);
  const n = Math.max(1, Math.min(Number(count) || 5, 10));
  const base = s.length ? s : [text];
  return Array.from({length:n}, (_,i) => {
    const source = base[i % base.length].replace(/[.!?]+$/, '');
    const answer = source.split(/\s+/).slice(0, 5).join(' ');
    const distractors = [
      'A different process described in the material',
      'An unrelated concept',
      'A supporting detail from another topic'
    ];
    return {
      question: `Which option best relates to this statement: "${source.slice(0, 90)}${source.length > 90 ? '...' : ''}"?`,
      options: [answer, ...distractors],
      answer,
      explanation: 'Development-mode question generated from the supplied material.'
    };
  });
}

export async function answerQuestion(context, question) {
  const keywords = words(question);
  const scored = sentences(context).map(sentence => ({
    sentence,
    score: keywords.reduce((n,k) => n + (sentence.toLowerCase().includes(k) ? 1 : 0), 0)
  })).sort((a,b) => b.score-a.score);
  if (!scored[0] || scored[0].score === 0) {
    return 'No relevant information was found in the provided study material.';
  }
  return scored[0].sentence;
}

export async function analyze(text) {
  const topics = topKeywords(text, 6);
  return {
    keyTopics: topics,
    importantConcepts: sentences(text).slice(0, 5),
    difficulty: text.length > 1800 ? 'Advanced' : text.length > 700 ? 'Intermediate' : 'Beginner',
    suggestedStudyAreas: topics.slice(0, 4).map(t => `Review ${t}`)
  };
}
