-- Adds created_at/updated_at everywhere, a per-attempt history table, and the columns behind
-- per-user auth and name-change rate limiting.
--
-- SQLite will not accept a non-constant DEFAULT on ADD COLUMN, so the new timestamp columns go
-- in nullable and are backfilled from the values already on the row. Existing data is preserved.

ALTER TABLE users ADD COLUMN updated_at      INTEGER;
ALTER TABLE users ADD COLUMN name_updated_at INTEGER;
-- SHA-256 of the holder's secret, hex. NULL means a row from before auth existed: see 0003.
ALTER TABLE users ADD COLUMN secret_hash     TEXT;

UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
-- name_updated_at stays NULL for existing rows: nobody has renamed yet under the new rules, and
-- stamping them would start everyone on a cooldown they never triggered.

ALTER TABLE scores ADD COLUMN created_at INTEGER;
ALTER TABLE scores ADD COLUMN updated_at INTEGER;

UPDATE scores SET created_at = achieved_at WHERE created_at IS NULL;
UPDATE scores SET updated_at = achieved_at WHERE updated_at IS NULL;

-- Every completed attempt, not just the personal best that `scores` keeps.
CREATE TABLE IF NOT EXISTS score_history (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      TEXT    NOT NULL REFERENCES users(id),
  game_id      TEXT    NOT NULL,
  elapsed_time REAL    NOT NULL,
  points       INTEGER NOT NULL,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_user_created ON score_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_user_game    ON score_history(user_id, game_id);

-- Seed history with the one attempt per game we actually know about, so existing players do not
-- start with an empty history. Guarded so re-running cannot double up.
INSERT INTO score_history (user_id, game_id, elapsed_time, points, created_at, updated_at)
SELECT s.user_id, s.game_id, s.best_time, s.points, s.achieved_at, s.achieved_at
FROM scores s
WHERE NOT EXISTS (SELECT 1 FROM score_history h WHERE h.user_id = s.user_id AND h.game_id = s.game_id);
