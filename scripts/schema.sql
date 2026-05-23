-- Fresh install: run the full file.
-- Existing DB with films.genre: run only the MIGRATION block at the bottom once.

CREATE TABLE IF NOT EXISTS films (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genre_enum (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO genre_enum (name) VALUES
  ('Action'),
  ('Adventure'),
  ('Animation'),
  ('Comedy'),
  ('Crime'),
  ('Documentary'),
  ('Drama'),
  ('Family'),
  ('Fantasy'),
  ('Horror'),
  ('Mystery'),
  ('Romance'),
  ('Sci-Fi'),
  ('Thriller'),
  ('War'),
  ('Western')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS film_genres (
  film_id INTEGER NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  genre_name TEXT NOT NULL REFERENCES genre_enum(name) ON DELETE CASCADE,
  PRIMARY KEY (film_id, genre_name)
);

-- ========== MIGRATION (existing DBs with films.genre column only) ==========
-- INSERT INTO genre_enum (name)
-- SELECT DISTINCT genre FROM films WHERE genre IS NOT NULL AND genre <> ''
-- ON CONFLICT (name) DO NOTHING;
--
-- INSERT INTO film_genres (film_id, genre_name)
-- SELECT id, genre FROM films WHERE genre IS NOT NULL AND genre <> ''
-- ON CONFLICT DO NOTHING;
--
-- ALTER TABLE films DROP COLUMN IF EXISTS genre;
