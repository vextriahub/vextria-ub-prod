-- RLS para tabela PROFILES (existente, validar)
-- Verificar policies atuais
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'profiles';

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas seu próprio perfil
CREATE POLICY "profiles_user_self_view" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários atualizam apenas seus próprios dados
CREATE POLICY "profiles_user_self_update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Super admin vê tudo
CREATE POLICY "profiles_superadmin_all" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Política: Super admin pode atualizar
CREATE POLICY "profiles_superadmin_update" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Verificar resultado
SELECT tablename, policyname, qual FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
