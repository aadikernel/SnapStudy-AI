import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const AI_MODE = GEMINI_API_KEY
  ? "gemini"
  : "development mock";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* =========================================================
   HOME
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SnapStudy AI Backend is running 🚀",
    frontend: "http://localhost:5174",
    backend: "http://localhost:3001",
    aiMode: AI_MODE,
    model: GEMINI_API_KEY ? GEMINI_MODEL : null,
  });
});

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SnapStudy AI backend is running",
    port: PORT,
    aiMode: AI_MODE,
  });
});

/* =========================================================
   AI STATUS
========================================================= */

app.get("/api/ai/status", (req, res) => {
  res.json({
    success: true,
    mode: AI_MODE,
    provider: GEMINI_API_KEY
      ? "Google Gemini"
      : "Mock AI",
    model: GEMINI_API_KEY
      ? GEMINI_MODEL
      : null,
    snapdragonReady: true,
  });
});

/* =========================================================
   DASHBOARD STATS
========================================================= */

app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    stats: {
      notes: 0,
      summaries: 0,
      questions: 0,
      quizzes: 0,
    },
    recentActivity: [],
  });
});

/* =========================================================
   MOCK SUMMARY
========================================================= */

function createMockSummary(text) {
  const cleanText = String(text || "").trim();

  if (!cleanText) {
    return "Please provide study material.";
  }

  const preview =
    cleanText.length > 700
      ? cleanText.substring(0, 700) + "..."
      : cleanText;

  return `AI Summary:

${preview}

Key Points:
• Review the main concepts.
• Identify important definitions.
• Focus on examples and applications.
• Use these points for quick revision.`;
}

/* =========================================================
   MOCK QUESTIONS
========================================================= */

function createMockQuestions() {
  return [
    {
      question:
        "What is the main concept discussed in the study material?",
      answer:
        "Identify the central topic and the most important idea explained in the material.",
    },
    {
      question:
        "What are the important points mentioned in the material?",
      answer:
        "The important points include the major concepts, definitions, examples and applications.",
    },
    {
      question:
        "Why is this topic important?",
      answer:
        "It provides important knowledge that can be used for further learning and practical applications.",
    },
    {
      question:
        "What definitions should a student remember?",
      answer:
        "Students should remember the key terms and definitions introduced in the material.",
    },
    {
      question:
        "How can the concepts be applied?",
      answer:
        "The concepts can be applied by understanding the theory and using it to solve practical problems.",
    },
  ];
}

/* =========================================================
   MOCK QUIZ
========================================================= */

function createMockQuiz() {
  return [
    {
      question:
        "What is the purpose of an AI study assistant?",
      options: [
        "Help students learn",
        "Replace teachers",
        "Create hardware",
        "Browse social media",
      ],
      answer: "Help students learn",
    },
    {
      question:
        "Which approach can improve AI privacy?",
      options: [
        "On-device processing",
        "Publicly sharing data",
        "Removing security",
        "Disabling AI",
      ],
      answer: "On-device processing",
    },
    {
      question:
        "What can AI generate from study notes?",
      options: [
        "Summaries and questions",
        "Only music",
        "Only hardware",
        "Only games",
      ],
      answer: "Summaries and questions",
    },
  ];
}

/* =========================================================
   GEMINI
========================================================= */

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    return null;
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Calling Gemini model: ${GEMINI_MODEL} (attempt ${attempt}/${maxRetries})`
      );

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const generatedText =
          data?.candidates?.[0]?.content?.parts
            ?.map((part) => part?.text || "")
            .join("")
            .trim();

        return generatedText || "No response generated.";
      }

      const errorText = await response.text();

      console.error(
        `Gemini request failed: HTTP ${response.status}`
      );

      if (response.status === 503 && attempt < maxRetries) {
        console.log(
          `Gemini is temporarily busy. Retrying in ${attempt * 3} seconds...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 3000)
        );

        continue;
      }

      if (response.status === 503) {
        throw new Error(
          "Gemini is temporarily experiencing high demand. Please wait a few minutes and try again."
        );
      }

      if (response.status === 429) {
        throw new Error(
          "Gemini API rate limit reached. Please wait and try again."
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Gemini API authentication failed. Check your API key."
        );
      }

      if (response.status === 404) {
        throw new Error(
          `Gemini model "${GEMINI_MODEL}" was not found. Check GEMINI_MODEL in your .env file.`
        );
      }

      throw new Error(
        `Gemini API error ${response.status}: ${errorText}`
      );
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === maxRetries) {
        throw error;
      }

      if (
        error.message.includes(
          "temporarily experiencing high demand"
        ) ||
        error.message.includes(
          "authentication failed"
        ) ||
        error.message.includes(
          "rate limit reached"
        ) ||
        error.message.includes(
          "was not found"
        )
      ) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 3000)
      );
    }
  }

  throw new Error(
    "Unable to get a response from Gemini."
  );
}

/* =========================================================
   SUMMARIZE
========================================================= */

app.post("/api/ai/summarize", async (req, res) => {
  try {
    const text = req.body?.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required.",
      });
    }

    let summary;

    if (GEMINI_API_KEY) {
      summary = await callGemini(`
You are SnapStudy AI, an AI study assistant for college students.

Summarize the following study material clearly and accurately.

Include:

1. Main topic
2. Important concepts
3. Key points
4. Important definitions
5. Quick revision notes

Keep the explanation easy to understand.

Study material:

${text}
`);
    } else {
      summary = createMockSummary(text);
    }

    res.json({
      success: true,
      summary,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Summarize error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   QUESTIONS
========================================================= */

app.post("/api/ai/questions", async (req, res) => {
  try {
    const text = req.body?.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required.",
      });
    }

    let questions;

    if (GEMINI_API_KEY) {
      questions = await callGemini(`
You are SnapStudy AI.

Generate 5 important exam-style questions from the following study material.

For each question:
- Write the question.
- Give a short answer.

Study material:

${text}
`);
    } else {
      questions = createMockQuestions();
    }

    res.json({
      success: true,
      questions,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Questions error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   QUIZ
========================================================= */

app.post("/api/ai/quiz", async (req, res) => {
  try {
    const text = req.body?.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required.",
      });
    }

    let quiz;

    if (GEMINI_API_KEY) {
      quiz = await callGemini(`
You are SnapStudy AI.

Create 5 multiple-choice questions from the following study material.

For every question provide:

Question:
Option A:
Option B:
Option C:
Option D:
Correct Answer:

Make the questions useful for college exam preparation.

Study material:

${text}
`);
    } else {
      quiz = createMockQuiz();
    }

    res.json({
      success: true,
      quiz,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Quiz error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   MCQ ALIAS
========================================================= */

app.post("/api/ai/mcqs", async (req, res) => {
  try {
    const text = req.body?.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Text is required.",
      });
    }

    let mcqs;

    if (GEMINI_API_KEY) {
      mcqs = await callGemini(`
You are SnapStudy AI.

Generate 5 multiple-choice questions from this study material.

Each question must contain:
- Question
- Four options
- Correct answer

Study material:

${text}
`);
    } else {
      mcqs = createMockQuiz();
    }

    res.json({
      success: true,
      mcqs,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("MCQ error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   ASK AI
========================================================= */

app.post("/api/ai/ask", async (req, res) => {
  try {
    const question = req.body?.question || "";
    const context = req.body?.context || "";

    if (!question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required.",
      });
    }

    let answer;

    if (GEMINI_API_KEY) {
      answer = await callGemini(`
You are SnapStudy AI.

Answer the student's question clearly and accurately.

Use the provided study material as context.

If the answer is not available in the material, say that clearly and then provide a general explanation.

Study material:

${context}

Student question:

${question}
`);
    } else {
      answer = `Demo AI Answer:

Question:
${question}

This is a mock response because SnapStudy AI is currently running in development mode.`;
    }

    res.json({
      success: true,
      answer,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Ask error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   ANSWER ALIAS
========================================================= */

app.post("/api/ai/answer", async (req, res) => {
  try {
    const question = req.body?.question || "";
    const context = req.body?.context || "";

    if (!question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required.",
      });
    }

    let answer;

    if (GEMINI_API_KEY) {
      answer = await callGemini(`
You are SnapStudy AI.

Answer this student's question clearly.

Study material:

${context}

Question:

${question}
`);
    } else {
      answer = `Demo AI Answer:

Question:
${question}

This is a development mock response.`;
    }

    res.json({
      success: true,
      answer,
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Answer error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   ANALYZE
========================================================= */

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const text = req.body?.text || "";

    const wordCount = text.trim()
      ? text.trim().split(/\s+/).length
      : 0;

    res.json({
      success: true,
      analysis: {
        wordCount,
        estimatedReadingTime:
          wordCount > 0
            ? `${Math.max(
                1,
                Math.ceil(wordCount / 200)
              )} min`
            : "0 min",
        topics: ["Study Material"],
      },
      mode: AI_MODE,
    });
  } catch (error) {
    console.error("Analyze error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================================
   NOTES UPLOAD
========================================================= */

app.post(
  "/api/notes/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded.",
        });
      }

      const text = req.file.buffer.toString("utf8");

      res.json({
        success: true,
        filename: req.file.originalname,
        text,
        message: "File uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    error:
      error.message || "Internal server error",
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SnapStudy AI backend running on http://localhost:${PORT}`
  );

  console.log(`AI mode: ${AI_MODE}`);
  console.log(
    `Gemini model: ${
      GEMINI_API_KEY ? GEMINI_MODEL : "none"
    }`
  );
});