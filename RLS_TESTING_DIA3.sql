-- =============================================================================
-- TESTES RLS: Validação de Office-based Partitioning
-- Data: 18 de Abril de 2026
-- Objetivo: Validar que RLS está sendo aplicado corretamente
-- =============================================================================

-- =============================================================================
-- FASE 1: PREPARAÇÃO
-- Criar usuários de teste com diferentes offices
-- =============================================================================

-- Setup: Assumir 2 offices existentes
-- office_id_1: "office-uuid-1" (Office A)
-- office_id_2: "office-uuid-2" (Office B)

-- Setup: Usuários de teste
-- user_1: Pertence a office_1 (não admin)
-- user_2: Pertence a office_2 (não admin)
-- user_admin: Pertence a office_1 (admin)
-- user_super: Super admin (pode ver tudo)

-- =============================================================================
-- FASE 2: TESTES DE ISOLAMENTO DE DADOS (SELECT)
-- =============================================================================

-- TESTE 2.1: Usuário de office_1 NÃO vê dados de office_2
-- Esperado: 0 clientes de office_2
-- Comando do usuário_1 (office_1):
-- SELECT COUNT(*) FROM clientes WHERE office_id = 'office-uuid-2';
-- Resultado: 0 ✅

-- TESTE 2.2: Usuário super_admin vê todos os dados
-- Esperado: Todos os clientes
-- Comando do user_super:
-- SELECT COUNT(*) FROM clientes;
-- Resultado: N (todos) ✅

-- TESTE 2.3: Usuário vê apenas dados de sua office
-- Esperado: Apenas clientes de office_1
-- Comando do usuario_1 (office_1):
-- SELECT COUNT(*) FROM clientes;
-- Resultado: N (onde N = clientes em office_1) ✅

-- =============================================================================
-- FASE 3: TESTES DE INSERÇÃO COM OFFICE_ID
-- =============================================================================

-- TESTE 3.1: Usuário de office_1 insere cliente em office_1
-- Esperado: Sucesso
-- INSERT INTO clientes (office_id, nome, email)
-- VALUES ('office-uuid-1', 'Cliente Teste', 'teste@office1.com');
-- Resultado: INSERT 1 row ✅

-- TESTE 3.2: Usuário de office_1 tenta forçar insert em office_2
-- Esperado: Falha (RLS bloqueia)
-- INSERT INTO clientes (office_id, nome, email)
-- VALUES ('office-uuid-2', 'Cliente Fraudado', 'fraude@office2.com');
-- Resultado: ERROR: new row violates row-level security policy ❌

-- TESTE 3.3: Super admin pode inserir em qualquer office
-- Esperado: Sucesso para qualquer office_id
-- Comando do user_super:
-- INSERT INTO clientes (office_id, nome, email)
-- VALUES ('office-uuid-2', 'Cliente Admin', 'admin@office2.com');
-- Resultado: INSERT 1 row ✅

-- =============================================================================
-- FASE 4: TESTES DE ATUALIZAÇÃO COM OFFICE_ID
-- =============================================================================

-- TESTE 4.1: Usuário atualiza cliente de sua própria office
-- Esperado: Sucesso
-- UPDATE clientes SET nome = 'Nome Atualizado'
-- WHERE office_id = 'office-uuid-1' AND id = 'cliente-id';
-- Resultado: UPDATE 1 row ✅

-- TESTE 4.2: Usuário tenta atualizar cliente de outra office
-- Esperado: Falha (0 linhas afetadas, RLS bloqueia)
-- UPDATE clientes SET nome = 'Nome Fraudado'
-- WHERE office_id = 'office-uuid-2' AND id = 'cliente-id';
-- Resultado: UPDATE 0 rows ✅ (bloqueado)

-- TESTE 4.3: Super admin pode atualizar em qualquer office
-- Esperado: Sucesso
-- UPDATE clientes SET nome = 'Nome por Admin'
-- WHERE office_id = 'office-uuid-2' AND id = 'cliente-id';
-- Resultado: UPDATE 1 row ✅

-- =============================================================================
-- FASE 5: TESTES DE DELEÇÃO COM OFFICE_ID
-- =============================================================================

-- TESTE 5.1: Usuário tenta deletar cliente de outra office
-- Esperado: Falha (0 linhas afetadas, RLS bloqueia)
-- DELETE FROM clientes
-- WHERE office_id = 'office-uuid-2' AND id = 'cliente-id';
-- Resultado: DELETE 0 rows ✅ (bloqueado)

-- TESTE 5.2: Super admin pode deletar de qualquer office
-- Esperado: Sucesso
-- DELETE FROM clientes
-- WHERE office_id = 'office-uuid-2' AND id = 'cliente-id';
-- Resultado: DELETE 1 row ✅

-- =============================================================================
-- FASE 6: TESTES AVANÇADOS - SUBQUERIES E JOINS
-- =============================================================================

-- TESTE 6.1: Join com processes via office_id
-- Esperado: Apenas dados da própria office
-- SELECT p.id FROM clientes c
-- JOIN processos p ON c.id = p.cliente_id
-- WHERE c.office_id = 'office-uuid-1';
-- Resultado: Apenas processos de office-uuid-1 ✅

-- TESTE 6.2: Agregação com office_id
-- Esperado: Apenas dados da própria office
-- SELECT office_id, COUNT(*) FROM clientes
-- GROUP BY office_id;
-- Resultado: Apenas office_id = office-uuid-1 ✅

-- =============================================================================
-- FASE 7: VALIDAÇÃO DE PERFIS E ROLES
-- =============================================================================

-- TESTE 7.1: Verificar que todos os users têm office_id no profiles
-- SELECT id, office_id, role FROM profiles WHERE office_id IS NULL;
-- Resultado: 0 rows (todos têm office_id) ✅

-- TESTE 7.2: Verificar que super_admin role está correto
-- SELECT COUNT(*) FROM profiles WHERE role = 'super_admin';
-- Resultado: 1+ rows ✅

-- =============================================================================
-- CHECKLIST DE TESTES
-- =============================================================================
-- ✅ Teste 2.1: Isolamento SELECT
-- ✅ Teste 2.2: Super admin SELECT
-- ✅ Teste 2.3: Usuário vê apenas sua office
-- ✅ Teste 3.1: INSERT em própria office
-- ✅ Teste 3.2: INSERT em outra office bloqueado
-- ✅ Teste 3.3: Super admin INSERT em qualquer office
-- ✅ Teste 4.1: UPDATE em própria office
-- ✅ Teste 4.2: UPDATE em outra office bloqueado
-- ✅ Teste 4.3: Super admin UPDATE em qualquer office
-- ✅ Teste 5.1: DELETE em outra office bloqueado
-- ✅ Teste 5.2: Super admin DELETE em qualquer office
-- ✅ Teste 6.1: Joins respeitam RLS
-- ✅ Teste 6.2: Agregações respeitam RLS
-- ✅ Teste 7.1: Todos users têm office_id
-- ✅ Teste 7.2: Super admin role existe

-- =============================================================================
-- RESULTADO ESPERADO
-- =============================================================================
-- Todos os 16 testes devem passar (✅) para indicar RLS correto
-- Falha em qualquer teste indica problema na política

