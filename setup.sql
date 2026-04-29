-- Run this in your Supabase SQL Editor to set up the database tables

-- 1. Create tables
CREATE TABLE todos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    distance NUMERIC NOT NULL,
    duration TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies so users can only see and edit their own data

-- Policies for todos
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- Policies for links
CREATE POLICY "Users can view their own links" ON links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own links" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON links FOR DELETE USING (auth.uid() = user_id);

-- Policies for runs
CREATE POLICY "Users can view their own runs" ON runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own runs" ON runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own runs" ON runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own runs" ON runs FOR DELETE USING (auth.uid() = user_id);

-- 4. Create new tables for Memos and Dashboard
CREATE TABLE memos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE dashboard_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    layout JSONB NOT NULL DEFAULT '["tasks", "links", "runs", "calendar"]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS and create policies for new tables
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memos" ON memos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own memos" ON memos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memos" ON memos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own memos" ON memos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own dashboard config" ON dashboard_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dashboard config" ON dashboard_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dashboard config" ON dashboard_config FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dashboard config" ON dashboard_config FOR DELETE USING (auth.uid() = user_id);
