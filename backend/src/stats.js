// In-memory stats — resets on server restart (no DB required for MVP)
const MAX_ACTIVITY = 10;

export const stats = {
  notes: 0,
  summaries: 0,
  questions: 0,
  quizzes: 0,
  activity: [],

  addActivity(label) {
    this.activity.unshift({ label, time: new Date().toISOString() });
    if (this.activity.length > MAX_ACTIVITY) this.activity.pop();
  },

  get() {
    return {
      notes: this.notes,
      summaries: this.summaries,
      questions: this.questions,
      quizzes: this.quizzes,
      activity: this.activity,
    };
  },
};
