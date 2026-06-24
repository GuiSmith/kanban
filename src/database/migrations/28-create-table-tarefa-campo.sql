CREATE TABLE IF NOT EXISTS tarefa_campo (
    id SERIAL PRIMARY KEY,
    id_campo INT NOT NULL REFERENCES campo(id),
    obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
    valor TEXT
);
