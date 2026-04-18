-- RLS para tabela PROCESSOS (implementação nova)
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem processos do seu próprio office
CREATE POLICY "processos_user_office_view" ON processos
  FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Usuários inserem processos no seu office
CREATE POLICY "processos_user_office_insert" ON processos
  FOR INSERT
  WITH CHECK (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Usuários atualizam processos do seu office
CREATE POLICY "processos_user_office_update" ON processos
  FOR UPDATE
  USING (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Usuários deletam processos do seu office
CREATE POLICY "processos_user_office_delete" ON processos
  FOR DELETE
  USING (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Super admin vê todos
CREATE POLICY "processos_superadmin_all" ON processos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

SELECT tablename, policyname FROM pg_policies WHERE tablename = 'processos' ORDER BY policyname;
