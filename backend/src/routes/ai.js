import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import * as mock from '../services/mockAdapter.js';
import * as gemini from '../services/geminiAdapter.js';
import { stats } from '../stats.js';

const router = Router();
const upload = multer({ storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

function validateText(text, field = 'text') {
  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return `${field} must contain at least 20 characters.`;
  }
  return null;
}

function countValue(value) {
  const n = Number(value ?? 5);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
}

function usingGemini() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function adapter() {
  return usingGemini() ? gemini : mock;
}

async function run(operation) {
  try {
    return await operation(adapter());
  } catch (error) {
    // If Gemini is configured but fails, don't silently fake an AI response.
    throw error;
  }
}

router.get('/status', (req, res) => {
  const ai = adapter();
  res.json({
    success: true,
    adapter: ai.getAdapterName(),
    provider: usingGemini() ? 'google-gemini' : 'mock-demo',
    mode: usingGemini() ? 'ai' : 'development',
    ready: true
  });
});

router.post('/summarize', async (req, res) => {
  const err = validateText(req.body?.text);
  if (err) return res.status(400).json({ success: false, error: err });
  try {
    const summary = await run(ai => ai.summarize(req.body.text));
    stats.summaries++;
    stats.addActivity('Summarized notes');
    res.json({ success: true, summary, adapter: adapter().getAdapterName() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
});

router.post('/questions', async (req, res) => {
  const err = validateText(req.body?.text);
  if (err) return res.status(400).json({ success: false, error: err });
  const count = countValue(req.body?.count);
  if (!count) return res.status(400).json({ success: false, error: 'count must be an integer from 1 to 10.' });
  try {
    const questions = await run(ai => ai.generateQuestions(req.body.text, count));
    stats.questions += questions.length;
    stats.addActivity('Generated questions');
    res.json({ success: true, questions, adapter: adapter().getAdapterName() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
});

async function quizHandler(req, res) {
  const err = validateText(req.body?.text);
  if (err) return res.status(400).json({ success: false, error: err });
  const count = countValue(req.body?.count);
  if (!count) return res.status(400).json({ success: false, error: 'count must be an integer from 1 to 10.' });
  try {
    const mcqs = await run(ai => ai.generateMCQs(req.body.text, count));
    stats.quizzes++;
    stats.addActivity('Generated MCQ quiz');
    res.json({ success: true, mcqs, adapter: adapter().getAdapterName() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
}
router.post('/mcqs', quizHandler);
router.post('/quiz', quizHandler);

async function answerHandler(req, res) {
  const { context, text, question } = req.body || {};
  const material = context || text;
  const err = validateText(material, 'context');
  if (err) return res.status(400).json({ success: false, error: err });
  if (!question || typeof question !== 'string' || question.trim().length < 3) {
    return res.status(400).json({ success: false, error: 'Please enter a question.' });
  }
  try {
    const answer = await run(ai => ai.answerQuestion(material, question));
    stats.addActivity('Answered a question');
    res.json({ success: true, answer, adapter: adapter().getAdapterName() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
}
router.post('/answer', answerHandler);
router.post('/ask', answerHandler);

router.post('/analyze', async (req, res) => {
  const err = validateText(req.body?.text);
  if (err) return res.status(400).json({ success: false, error: err });
  try {
    const analysis = await run(ai => ai.analyze ? ai.analyze(req.body.text) : mock.analyze(req.body.text));
    stats.addActivity('Analyzed study material');
    res.json({ success: true, analysis, adapter: adapter().getAdapterName() });
  } catch (e) { res.status(502).json({ success: false, error: e.message }); }
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' });
  if (!req.file.mimetype.startsWith('text/')) {
    return res.status(400).json({ success: false, error: 'Only plain text files are supported.' });
  }
  const text = req.file.buffer.toString('utf-8');
  stats.notes++;
  stats.addActivity('Uploaded notes file');
  res.json({ success: true, text });
});

export default router;
