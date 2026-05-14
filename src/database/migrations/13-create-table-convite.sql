DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'espaco_convite_status') THEN
        CREATE TYPE espaco_convite_status AS ENUM (
            'PENDENTE',
            'ACEITO',
            'RECUSADO'
        );
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS espaco_convite (
    id SERIAL PRIMARY KEY,
    id_espaco INT NOT NULL REFERENCES espaco(id),
    id_usuario INT NOT NULL REFERENCES usuario(id),
    status espaco_convite_status NOT NULL,
    enviar_email BOOLEAN DEFAULT FALSE,
    id_email_log INT REFERENCES email_log(id),
    data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    data_aceite TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    data_recusa TIMESTAMP WITH TIME ZONE DEFAULT NULL
);