ALTER TABLE coluna
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE email_log
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE espaco_convite
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo',
    ALTER COLUMN data_aceite TYPE timestamp without time zone
    USING data_aceite AT TIME ZONE 'America/Sao_Paulo',
    ALTER COLUMN data_recusa TYPE timestamp without time zone
    USING data_recusa AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE espaco_permissoes
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE espaco_usuario_permissoes
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE tarefa
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo',
    ALTER COLUMN data_atualizacao TYPE timestamp without time zone
    USING data_atualizacao AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE tarefa_arquivo
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';

ALTER TABLE usuario
    ALTER COLUMN data_cadastro TYPE timestamp without time zone
    USING data_cadastro AT TIME ZONE 'America/Sao_Paulo';