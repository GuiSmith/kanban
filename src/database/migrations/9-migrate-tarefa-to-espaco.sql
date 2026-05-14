BEGIN;

-- 1. Cria coluna de espaço nullable
ALTER TABLE tarefa ADD COLUMN id_espaco INT REFERENCES espaco(id);

-- 2. Criar espaço padrão para cada usuário que tem tarefa
INSERT INTO espaco (id_usuario, nome, descricao, sigla, icon)
SELECT
    u.id,
    'Espaço pessoal',
    'Espaço criado automaticamente para migração de tarefas individuais',
    'EP',
    'Folder'
FROM usuario u
WHERE EXISTS (
    SELECT 1
    FROM tarefa t
    WHERE t.id_usuario = u.id
);

-- 3. Migrar tarefas para os espaços
UPDATE tarefa t
SET id_espaco = e.id
FROM usuario u
JOIN espaco e ON u.id = e.id_usuario
WHERE u.id = t.id_usuario
    AND t.id_espaco IS NULL
    AND e.nome = 'Espaço pessoal'
    AND icon = 'Folder';

-- 4. Tirar FK de usuário na tarefa
ALTER TABLE tarefa DROP CONSTRAINT tarefa_id_usuario_fkey;

-- 5. Tirar coluna de usuário nas tarefas
ALTER TABLE tarefa DROP COLUMN id_usuario;

-- 6. Adicionando FK de espaço na tarefa
ALTER TABLE tarefa ADD CONSTRAINT fk_tarefa_espaco FOREIGN KEY (id_espaco) REFERENCES espaco(id);

COMMIT;