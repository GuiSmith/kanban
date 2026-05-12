CREATE TABLE IF NOT EXISTS tarefa_arquivo (
  id SERIAL PRIMARY KEY,
  id_tarefa INT REFERENCES tarefa(id),
  id_opera INT,
  descricao VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  public_url TEXT
);