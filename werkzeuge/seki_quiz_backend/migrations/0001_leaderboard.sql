CREATE TABLE IF NOT EXISTS leaderboard (
  quiz_id TEXT NOT NULL,
  browser_id TEXT NOT NULL,
  pseudonym TEXT NOT NULL,
  class_name TEXT NOT NULL,
  best_points INTEGER NOT NULL DEFAULT 0 CHECK (best_points >= 0 AND best_points <= 1800),
  best_date TEXT NOT NULL,
  score_version TEXT NOT NULL,
  PRIMARY KEY (quiz_id, browser_id, score_version)
);

CREATE INDEX IF NOT EXISTS leaderboard_by_quiz
  ON leaderboard (quiz_id, class_name, score_version, best_points DESC, best_date ASC);
