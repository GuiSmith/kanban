CREATE TABLE IF NOT EXISTS campo (
    id SERIAL PRIMARY KEY,
    id_tipo_tarefa INT REFERENCES tipo_tarefa(id),
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
    tipo VARCHAR(100) NOT NULL CHECK (tipo IN ('text','textarea','number','date','datetime','boolean','select','multiselect','user')),
    tipo_label VARCHAR(100) NOT NULL,
    opcoes VARCHAR(100)[],
    valor TEXT
);
