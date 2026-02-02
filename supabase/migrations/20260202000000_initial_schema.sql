-- CreatorFlow MIND-SAFE Database Schema
-- Initial migration with risk detection support

-- ============================================
-- EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;      -- For future message embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- For fuzzy text search

-- ============================================
-- CUSTOM TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('none', 'low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_mode AS ENUM ('dump', 'processar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'archived', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    preferred_mode session_mode DEFAULT 'dump',
    language TEXT DEFAULT 'pt-BR',
    data_retention_days INTEGER DEFAULT 90 CHECK (data_retention_days >= 1 AND data_retention_days <= 365),
    consent_given_at TIMESTAMPTZ,
    consent_version TEXT DEFAULT '1.0',
    total_sessions INTEGER DEFAULT 0 CHECK (total_sessions >= 0),
    last_risk_level risk_level DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'User profiles with preferences and consent tracking';
COMMENT ON COLUMN public.users.last_risk_level IS 'Most recent risk level detected across all sessions';
COMMENT ON COLUMN public.users.data_retention_days IS 'GDPR: how long to retain user data (1-365 days)';

-- Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    mode session_mode NOT NULL DEFAULT 'dump',
    max_risk_level risk_level DEFAULT 'none',
    risk_events_count INTEGER DEFAULT 0 CHECK (risk_events_count >= 0),
    emergency_triggered BOOLEAN DEFAULT FALSE,
    status session_status DEFAULT 'active',
    message_count INTEGER DEFAULT 0 CHECK (message_count >= 0),
    context_summary JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    scheduled_deletion_at TIMESTAMPTZ
);

COMMENT ON TABLE public.sessions IS 'Chat sessions with risk tracking and lifecycle management';
COMMENT ON COLUMN public.sessions.max_risk_level IS 'Highest risk level detected in this session';
COMMENT ON COLUMN public.sessions.emergency_triggered IS 'Whether emergency response was activated';
COMMENT ON COLUMN public.sessions.scheduled_deletion_at IS 'GDPR: when this session should be auto-deleted';

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    mode session_mode NOT NULL,
    risk_level risk_level DEFAULT 'none',
    risk_indicators JSONB DEFAULT '[]'::jsonb,
    is_emergency_response BOOLEAN DEFAULT FALSE,
    tokens_input INTEGER CHECK (tokens_input IS NULL OR tokens_input >= 0),
    tokens_output INTEGER CHECK (tokens_output IS NULL OR tokens_output >= 0),
    model_used TEXT,
    response_time_ms INTEGER CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.messages IS 'Individual messages with risk assessment metadata';
COMMENT ON COLUMN public.messages.risk_indicators IS 'Array of detected risk patterns from assessRisk()';
COMMENT ON COLUMN public.messages.is_emergency_response IS 'True if this is a MIND-SAFE emergency response';

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_last_risk_level ON public.users(last_risk_level)
    WHERE last_risk_level IN ('high', 'critical');

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(user_id, status)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_risk ON public.sessions(max_risk_level)
    WHERE max_risk_level IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_deletion ON public.sessions(scheduled_deletion_at)
    WHERE scheduled_deletion_at IS NOT NULL;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_risk ON public.messages(risk_level)
    WHERE risk_level IN ('high', 'critical');
CREATE INDEX IF NOT EXISTS idx_messages_emergency ON public.messages(session_id)
    WHERE is_emergency_response = TRUE;

-- Trigram index for fuzzy search (uses pg_trgm extension)
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON public.messages
    USING gin(content gin_trgm_ops);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions"
    ON public.sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
    ON public.sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON public.sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON public.sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Note: No UPDATE/DELETE policies for messages - they are immutable for audit trail

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update session stats when a message is added
CREATE OR REPLACE FUNCTION public.update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.sessions
    SET
        message_count = message_count + 1,
        last_activity_at = NOW(),
        max_risk_level = CASE
            WHEN NEW.risk_level::text > max_risk_level::text THEN NEW.risk_level
            ELSE max_risk_level
        END,
        risk_events_count = CASE
            WHEN NEW.risk_level IN ('high', 'critical') THEN risk_events_count + 1
            ELSE risk_events_count
        END,
        emergency_triggered = CASE
            WHEN NEW.is_emergency_response THEN TRUE
            ELSE emergency_triggered
        END
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user stats when session risk changes
CREATE OR REPLACE FUNCTION public.update_user_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.max_risk_level IS DISTINCT FROM OLD.max_risk_level THEN
        UPDATE public.users
        SET
            last_risk_level = NEW.max_risk_level,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment user's total sessions count
CREATE OR REPLACE FUNCTION public.increment_user_sessions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET
        total_sessions = total_sessions + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule session for deletion based on user's retention preference
CREATE OR REPLACE FUNCTION public.schedule_session_deletion()
RETURNS TRIGGER AS $$
DECLARE
    retention_days INTEGER;
BEGIN
    SELECT data_retention_days INTO retention_days
    FROM public.users
    WHERE id = NEW.user_id;

    NEW.scheduled_deletion_at = NOW() + (COALESCE(retention_days, 90) || ' days')::INTERVAL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Users triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sessions triggers
DROP TRIGGER IF EXISTS on_session_created ON public.sessions;
CREATE TRIGGER on_session_created
    BEFORE INSERT ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.schedule_session_deletion();

DROP TRIGGER IF EXISTS on_session_created_increment ON public.sessions;
CREATE TRIGGER on_session_created_increment
    AFTER INSERT ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.increment_user_sessions();

DROP TRIGGER IF EXISTS on_session_risk_changed ON public.sessions;
CREATE TRIGGER on_session_risk_changed
    AFTER UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_risk_level();

-- Messages triggers
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_session_on_message();

-- ============================================
-- GDPR: Scheduled deletion job (run via pg_cron or external scheduler)
-- ============================================

-- Function to delete expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM public.sessions
        WHERE scheduled_deletion_at IS NOT NULL
          AND scheduled_deletion_at < NOW()
          AND status != 'deleted'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_sessions IS
    'GDPR compliance: Delete sessions past their retention date. Run daily via pg_cron.';

-- ============================================
-- INITIAL DATA / SEED (optional)
-- ============================================

-- No seed data needed for production
