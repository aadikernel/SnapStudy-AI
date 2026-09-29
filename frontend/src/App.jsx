import { useEffect, useState } from "react";

const API = "http://localhost:3001";

function App() {
  const [page, setPage] = useState("Dashboard");
  const [backend, setBackend] = useState(false);
  const [stats, setStats] = useState({
    notes: 0,
    summaries: 0,
    questions: 0,
    quizzes: 0,
  });

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBackend();
    loadStats();
  }, []);

  async function checkBackend() {
    try {
      const response = await fetch(`${API}/api/health`);

      if (response.ok) {
        setBackend(true);
      }
    } catch {
      setBackend(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(`${API}/api/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      console.log("Could not load stats");
    }
  }

  async function summarize() {
    if (!text.trim()) {
      setResult("Please enter some study material first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/ai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      setResult(data.summary || data.error || "No result");
    } catch {
      setResult("Could not connect to the backend.");
    }

    setLoading(false);
  }

  async function generateQuestions() {
    if (!text.trim()) {
      setResult("Please enter some study material first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/ai/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (Array.isArray(data.questions)) {
        setResult(
          data.questions
            .map((item, index) => {
              if (typeof item === "string") {
                return `${index + 1}. ${item}`;
              }

              return `${index + 1}. ${item.question}`;
            })
            .join("\n\n")
        );
      } else {
        setResult(data.questions || data.error || "No questions generated.");
      }
    } catch {
      setResult("Could not connect to the backend.");
    }

    setLoading(false);
  }

  async function generateQuiz() {
    if (!text.trim()) {
      setResult("Please enter some study material first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/ai/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (Array.isArray(data.quiz)) {
        setResult(
          data.quiz
            .map(
              (item, index) =>
                `${index + 1}. ${item.question}\n\n${item.options
                  ?.map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`)
                  .join("\n")}\n\nAnswer: ${item.answer}`
            )
            .join("\n\n--------------------\n\n")
        );
      } else {
        setResult(data.quiz || data.error || "No quiz generated.");
      }
    } catch {
      setResult("Could not connect to the backend.");
    }

    setLoading(false);
  }

  function Dashboard() {
    return (
      <div>
        <h1>Dashboard</h1>

        <div className="status">
          {backend ? (
            <span className="online">● Backend Connected</span>
          ) : (
            <span className="offline">● Backend Offline</span>
          )}
        </div>

        <div className="banner">
          <h2>⚡ Snapdragon-Ready AI Study Assistant</h2>
          <p>
            Learn smarter with summaries, questions and quizzes.
          </p>
          <small>⚠ Development Mock AI Mode</small>
        </div>

        <div className="cards">
          <div className="card">
            <span>📝</span>
            <h3>{stats.notes}</h3>
            <p>Notes Saved</p>
          </div>

          <div className="card">
            <span>✦</span>
            <h3>{stats.summaries}</h3>
            <p>Summaries</p>
          </div>

          <div className="card">
            <span>?</span>
            <h3>{stats.questions}</h3>
            <p>Questions</p>
          </div>

          <div className="card">
            <span>◈</span>
            <h3>{stats.quizzes}</h3>
            <p>Quizzes</p>
          </div>
        </div>

        <div className="welcome">
          <h2>Welcome to SnapStudy AI</h2>
          <p>
            Turn your study material into useful revision content.
          </p>

          <button onClick={() => setPage("Study Assistant")}>
            Start Studying →
          </button>
        </div>
      </div>
    );
  }

  function StudyAssistant() {
    return (
      <div>
        <h1>Study Assistant</h1>

        <div className="editor">
          <h2>Study Material</h2>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes or study material here..."
          />

          <div className="actions">
            <button onClick={summarize}>
              ✦ Summarize
            </button>

            <button onClick={generateQuestions}>
              ? Generate Questions
            </button>

            <button onClick={generateQuiz}>
              ◈ Generate Quiz
            </button>
          </div>
        </div>

        <div className="result">
          <h2>AI Result</h2>

          {loading ? (
            <p>Generating...</p>
          ) : (
            <pre>{result || "Your AI result will appear here."}</pre>
          )}
        </div>
      </div>
    );
  }

  function Notes() {
    return (
      <div>
        <h1>Notes</h1>

        <div className="welcome">
          <h2>📝 Your Study Notes</h2>
          <p>
            Add your study material in the Study Assistant to generate
            summaries and questions.
          </p>

          <button onClick={() => setPage("Study Assistant")}>
            Add Study Material
          </button>
        </div>
      </div>
    );
  }

  function Quiz() {
    return (
      <div>
        <h1>Quiz Generator</h1>

        <div className="welcome">
          <h2>◈ AI Quiz Generator</h2>
          <p>
            Enter your study material and generate multiple-choice questions.
          </p>

          <button onClick={() => setPage("Study Assistant")}>
            Create Quiz
          </button>
        </div>
      </div>
    );
  }

  function QA() {
    return (
      <div>
        <h1>Q&A</h1>

        <div className="welcome">
          <h2>❓ Ask SnapStudy AI</h2>
          <p>
            Use the Study Assistant to ask questions about your material.
          </p>

          <button onClick={() => setPage("Study Assistant")}>
            Ask AI
          </button>
        </div>
      </div>
    );
  }

  function Snapdragon() {
    return (
      <div>
        <h1>Snapdragon Info</h1>

        <div className="welcome">
          <h2>⚡ Snapdragon AI</h2>

          <p>
            SnapStudy AI is designed around an architecture that can
            support future on-device AI deployment.
          </p>

          <p>
            Current development mode uses a mock AI adapter. Actual
            Snapdragon hardware optimization should only be claimed after
            implementing and testing the corresponding Qualcomm/Snapdragon
            runtime.
          </p>
        </div>
      </div>
    );
  }

  function Content() {
    if (page === "Dashboard") return <Dashboard />;
    if (page === "Study Assistant") return <StudyAssistant />;
    if (page === "Notes") return <Notes />;
    if (page === "Quiz Generator") return <Quiz />;
    if (page === "Q&A") return <QA />;
    if (page === "Snapdragon Info") return <Snapdragon />;

    return <Dashboard />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          ⚡ <span>SnapStudy</span>
        </div>

        <p className="subtitle">AI STUDY ASSISTANT</p>

        <nav>
          {[
            "Dashboard",
            "Study Assistant",
            "Notes",
            "Quiz Generator",
            "Q&A",
            "Snapdragon Info",
          ].map((item) => (
            <button
              key={item}
              className={page === item ? "active" : ""}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header>
          <div>
            <h2>SnapStudy AI</h2>
            <p>Learn smarter. Study faster.</p>
          </div>

          <div className="mode">
            {backend ? "🟢 Connected" : "🔴 Offline"}
          </div>
        </header>

        <section className="content">
          <Content />
        </section>
      </main>
    </div>
  );
}

export default App;