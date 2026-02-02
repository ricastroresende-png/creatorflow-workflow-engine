-- =============================================
-- DUMP.DO v0.1 - SQL COMPLETO
-- Execute este script no Supabase SQL Editor
-- =============================================

-- 1. CHECK CONSTRAINTS para risk_level
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_last_risk_level_check;
ALTER TABLE public.users ADD CONSTRAINT users_last_risk_level_check
  CHECK (last_risk_level IN ('none', 'low', 'medium', 'high', 'critical'));

ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_max_risk_level_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_max_risk_level_check
  CHECK (max_risk_level IN ('none', 'low', 'medium', 'high', 'critical'));

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_risk_level_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_risk_level_check
  CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical'));

-- 2. INDEXES para performance (RLS e queries)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON public.sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 3. POLICY de INSERT para users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. TRIGGER de updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ✅ Verificação final
SELECT
  '✅ Dump.do v0.1 - Correções aplicadas!' as status,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_name LIKE '%risk_level%') as constraints_added,
  (SELECT COUNT(*) FROM pg_indexes WHERE indexname LIKE 'idx_%') as indexes_created;
