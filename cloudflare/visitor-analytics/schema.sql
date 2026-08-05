CREATE TABLE IF NOT EXISTS counters (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
) STRICT;

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  visited_at INTEGER NOT NULL,
  ip_ciphertext TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT NOT NULL,
  user_agent TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_country_time ON visits(country, visited_at);

INSERT OR IGNORE INTO counters (key, value) VALUES ('total_pageviews', 0);
