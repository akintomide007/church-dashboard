-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    church_name VARCHAR(255),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bible versions table
CREATE TABLE IF NOT EXISTS bible_versions (
    id SERIAL PRIMARY KEY,
    version_code VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    language VARCHAR(50) DEFAULT 'English'
);

-- Bible text table
CREATE TABLE IF NOT EXISTS bible_text (
    id SERIAL PRIMARY KEY,
    version_id INT REFERENCES bible_versions(id),
    book VARCHAR(50) NOT NULL,
    chapter INT NOT NULL,
    verse INT NOT NULL,
    text TEXT NOT NULL,
    UNIQUE(version_id, book, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_bible_lookup ON bible_text(version_id, book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_bible_search ON bible_text USING gin(to_tsvector('english', text));

-- Sermons table
CREATE TABLE IF NOT EXISTS sermons (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(500),
    scripture_reference VARCHAR(255),
    outline TEXT,
    notes TEXT,
    manuscript TEXT,
    sermon_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hymns table
CREATE TABLE IF NOT EXISTS hymns (
    id SERIAL PRIMARY KEY,
    hymnal VARCHAR(100),
    number INT,
    title VARCHAR(255) NOT NULL,
    first_line VARCHAR(255),
    lyrics TEXT,
    author VARCHAR(255),
    composer VARCHAR(255),
    themes TEXT[],
    scripture_references TEXT[]
);

CREATE INDEX IF NOT EXISTS idx_hymn_search ON hymns USING gin(to_tsvector('english', title || ' ' || COALESCE(lyrics, '')));

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) UNIQUE,
    primary_bible_version VARCHAR(10) DEFAULT 'NIV',
    primary_hymnal VARCHAR(100) DEFAULT 'baptist-hymnal',
    comparison_versions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projection sessions
CREATE TABLE IF NOT EXISTS projection_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    listening_mode VARCHAR(50),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Projection history
CREATE TABLE IF NOT EXISTS projection_history (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES projection_sessions(id),
    content_type VARCHAR(50),
    content_reference VARCHAR(255),
    displayed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default Bible versions
INSERT INTO bible_versions (version_code, full_name) VALUES
('NIV', 'New International Version'),
('KJV', 'King James Version'),
('ESV', 'English Standard Version'),
('NKJV', 'New King James Version'),
('NASB', 'New American Standard Bible')
ON CONFLICT (version_code) DO NOTHING;