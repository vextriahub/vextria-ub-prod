-- RLS para tabela CLIENTES (implementação nova)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem clientes do seu próprio office
CREATE POLICY "clientes_user_office_view" ON clientes
  FOR SELECT
  USING (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Usuários inserem clientes no seu office
CREATE POLICY "clientes_user_office_insert" ON clientes
  FOR INSERT
  WITH CHECK (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Usuários atualizam clientes do seu office
CREATE POLICY "clientes_user_office_update" ON clientes
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

-- Política: Usuários deletam clientes do seu office
CREATE POLICY "clientes_user_office_delete" ON clientes
  FOR DELETE
  USING (
    office_id IN (
      SELECT office_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Política: Super admin vê todos
CREATE POLICY "clientes_superadmin_all" ON clientes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

SELECT tablename, policyname FROM pg_policies WHERE tablename = 'clientes' ORDER BY policyname;
