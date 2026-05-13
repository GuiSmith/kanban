CREATE TABLE IF NOT EXISTS espaco (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id),
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    sigla CHAR(2) NOT NULL,
    icon VARCHAR(100) NOT NULL
);