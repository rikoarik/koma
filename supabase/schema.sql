-- ==============================================================================
-- KOMA PLATFORM: SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- "Anonim terhadap publik, akuntabel terhadap sistem"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_alias TEXT NOT NULL DEFAULT 'Tanpa Nama',
    author_type TEXT NOT NULL CHECK (author_type IN ('tanpa_nama', 'pseudonim')),
    content TEXT NOT NULL CHECK (char_length(content) >= 3 AND char_length(content) <= 2000),
    image_url TEXT,
    topic TEXT NOT NULL DEFAULT 'isi-kepala',
    response_mode TEXT NOT NULL CHECK (response_mode IN ('boleh_dibalas', 'cukup_didengar')),
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    ai_prompt TEXT,
    paper_color TEXT NOT NULL DEFAULT 'cream' CHECK (paper_color IN ('cream', 'kraft', 'lavender', 'charcoal')),
    rotation REAL DEFAULT 0,
    report_count INT NOT NULL DEFAULT 0,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. REPLIES TABLE
CREATE TABLE IF NOT EXISTS public.replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_alias TEXT NOT NULL DEFAULT 'Tanpa Nama',
    author_type TEXT NOT NULL CHECK (author_type IN ('tanpa_nama', 'pseudonim')),
    content TEXT NOT NULL CHECK (char_length(content) >= 2 AND char_length(content) <= 1000),
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('dengerin', 'relate', 'senyum', 'peluk')),
    session_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(post_id, reaction_type, session_hash)
);

-- 4. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'doxxing', 'kebencian', 'kekerasan', 'lainnya')),
    notes TEXT,
    reporter_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE FEED RETRIEVAL
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_topic ON public.posts(topic);
CREATE INDEX IF NOT EXISTS idx_posts_response_mode ON public.posts(response_mode);
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON public.replies(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Posts: Anyone can read visible posts
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (is_hidden = false);

-- Posts: Anyone can insert a post
CREATE POLICY "Anyone can create an anonymous post" 
ON public.posts FOR INSERT 
WITH CHECK (char_length(content) >= 3);

-- Replies: Anyone can read replies on visible posts
CREATE POLICY "Public replies are viewable by everyone" 
ON public.replies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE public.posts.id = public.replies.post_id 
    AND public.posts.is_hidden = false
  )
);

-- Replies: Anyone can insert a reply if post allows it ('boleh_dibalas')
CREATE POLICY "Anyone can create a reply if post allows responses" 
ON public.replies FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE public.posts.id = public.replies.post_id 
    AND public.posts.response_mode = 'boleh_dibalas'
  )
);

-- Reactions: Public can read and insert
CREATE POLICY "Anyone can view reactions" 
ON public.reactions FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add a reaction" 
ON public.reactions FOR INSERT 
WITH CHECK (true);

-- Reports: Public can submit a report, only service role can read
CREATE POLICY "Anyone can submit a report" 
ON public.reports FOR INSERT 
WITH CHECK (true);
