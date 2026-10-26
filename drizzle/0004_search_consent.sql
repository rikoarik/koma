-- Existing and new posts are never search-eligible without explicit permission.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_consent boolean NOT NULL DEFAULT false;
