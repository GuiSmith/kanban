CREATE TABLE IF NOT EXISTS tipo_tarefa (
    id SERIAL PRIMARY KEY,
    icone VARCHAR(100),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL
);