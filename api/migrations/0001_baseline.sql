-- Baseline. The live database was created by running src/db/schema.sql directly, before
-- migrations existed, so every statement here is IF NOT EXISTS: applying this to production
-- is a no-op that only records the baseline as applied. On a fresh database it builds it.

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
