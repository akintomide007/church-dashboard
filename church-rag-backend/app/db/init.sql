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

-- Songs table (contemporary worship songs)
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    lyrics TEXT,
    copyright_info VARCHAR(500),
    ccli_number VARCHAR(50),
    themes TEXT[],
    scripture_references TEXT[],
    key_signature VARCHAR(10),
    tempo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_song_search ON songs USING gin(to_tsvector('english', title || ' ' || COALESCE(lyrics, '')));

-- Teachings table (sermons, Bible studies, etc.)
CREATE TABLE IF NOT EXISTS teachings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    teacher VARCHAR(255),
    teaching_type VARCHAR(50) DEFAULT 'sermon', -- sermon, bible_study, devotional, etc.
    scripture_reference VARCHAR(255),
    outline TEXT,
    content TEXT,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    tags TEXT[],
    teaching_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teaching_search ON teachings USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) UNIQUE,
    primary_bible_version VARCHAR(10) DEFAULT 'NIV',
    primary_hymnal VARCHAR(100) DEFAULT 'baptist-hymnal',
    comparison_versions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slide preferences (per-user customization)
CREATE TABLE IF NOT EXISTS slide_preferences (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) UNIQUE,
    -- Songs settings
    songs_lines_per_slide INT DEFAULT 6,
    songs_font_size INT DEFAULT 38,
    songs_text_alignment VARCHAR(20) DEFAULT 'center',
    -- Hymns settings
    hymns_lines_per_slide INT DEFAULT 8,
    hymns_font_size INT DEFAULT 34,
    hymns_text_alignment VARCHAR(20) DEFAULT 'center',
    -- Announcements settings
    announcements_lines_per_slide INT DEFAULT 10,
    announcements_font_size INT DEFAULT 28,
    announcements_text_alignment VARCHAR(20) DEFAULT 'center',
    -- Uncategorized settings
    uncategorized_lines_per_slide INT DEFAULT 8,
    uncategorized_font_size INT DEFAULT 32,
    uncategorized_text_alignment VARCHAR(20) DEFAULT 'center',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
INSERT INTO bible_versions (version_code, full_name, language) VALUES
('NIV', 'New International Version', 'English'),
('KJV', 'King James Version', 'English'),
('ESV', 'English Standard Version', 'English'),
('NKJV', 'New King James Version', 'English'),
('NASB', 'New American Standard Bible', 'English'),
('ASV', 'American Standard Version', 'English'),
('WEB', 'World English Bible', 'English'),
('YLT', 'Youngs Literal Translation', 'English')
ON CONFLICT (version_code) DO NOTHING;
