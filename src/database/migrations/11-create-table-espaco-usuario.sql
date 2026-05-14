CREATE TABLE IF NOT EXISTS espaco_usuario (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuario(id),
    id_espaco INT NOT NULL REFERENCES espaco(id),
    permissoes TEXT[],
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);