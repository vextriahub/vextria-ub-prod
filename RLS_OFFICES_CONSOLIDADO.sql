-- =============================================================================
-- RLS CONSOLIDADO: Tabela OFFICES
-- Data: 18 de Abril de 2026
-- Objetivo: Otimizar de 8 para 4 políticas mantendo cobertura completa
-- =============================================================================

-- Habilitar RLS na tabela offices
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLÍTICA 1: Usuários veem sua própria office
-- Aplicável: SELECT
-- Lógica: Acesso baseado em office_id do usuário autenticado
-- =============================================================================
CREATE POLICY "offices_user_view_own" ON public.offices
  FOR SELECT
  USING (
    id IN (
      SELECT office_id FROM public.profiles
      WHERE id = auth.uid() AND office_id IS NOT NULL
    )
  );

-- =============================================================================
-- POLÍTICA 2: Usuários atualizam sua própria office
-- Aplicável: UPDATE
-- Lógica: Restrição para dados da própria office
-- =============================================================================
CREATE POLICY "offices_user_update_own" ON public.offices
  FOR UPDATE
  USING (
    id IN (
      SELECT office_id FROM public.profiles
      WHERE id = auth.uid() AND office_id IS NOT NULL
    )
  )
  WITH CHECK (
    id IN (
      SELECT office_id FROM public.profiles
      WHERE id = auth.uid() AND office_id IS NOT NULL
    )
  );

-- =============================================================================
-- POLÍTICA 3: Super admin vê todas as offices
-- Aplicável: SELECT
-- Lógica: Override de office_id para usuários com role super_admin
-- =============================================================================
CREATE POLICY "offices_superadmin_view_all" ON public.offices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =============================================================================
-- POLÍTICA 4: Super admin pode gerenciar todas as offices
-- Aplicável: UPDATE, DELETE
-- Lógica: Acesso total sem restrições de office_id
-- =============================================================================
CREATE POLICY "offices_superadmin_manage_all" ON public.offices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Adicionar política DELETE para super admin
CREATE POLICY "offices_superadmin_delete_all" ON public.offices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =============================================================================
-- VERIFICAÇÃO: Status das policies
-- =============================================================================
-- Execute para verificar:
-- SELECT tablename, policyname, cmd, qual FROM pg_policies
-- WHERE tablename = 'offices'
-- ORDER BY policyname;

-- Resultado esperado: 5 policies (user view, user update, superadmin view, superadmin update, superadmin delete)

-- =============================================================================
-- RESUMO DE CONSOLIDAÇÃO
-- =============================================================================
-- ANTES: 8 políticas redundantes
--   - 4 políticas genéricas com nomes descritivos mas duplicadas
--   - Sem pattern claro de cobertura
--
-- DEPOIS: 4 políticas otimizadas
--   1. offices_user_view_own: Usuários veem sua office
--   2. offices_user_update_own: Usuários atualizam sua office
--   3. offices_superadmin_view_all: Super admin vê tudo
--   4. offices_superadmin_manage_all: Super admin gerencia (UPDATE)
--   5. offices_superadmin_delete_all: Super admin deleta
--
-- Cobertura: 100% ✅
-- - SELECT: 2 policies (user own + superadmin all)
-- - UPDATE: 2 policies (user own + superadmin)
-- - DELETE: 1 policy (superadmin only)
-- - INSERT: Não aplicável (criação via aplicação/admin)

