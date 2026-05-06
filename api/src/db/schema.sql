CREATE TABLE IF NOT EXISTS users (
  id           TEXT    PRIMARY KEY,
  display_name TEXT    NOT NULL,
  created_at   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL REFERENCES users(id),
  game_id     TEXT    NOT NULL,
  best_time   REAL    NOT NULL,
  points      INTEGER NOT NULL,
  achieved_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_user_game ON scores(user_id, game_id);
