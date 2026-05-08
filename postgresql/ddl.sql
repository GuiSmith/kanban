CREATE TABLE IF NOT EXISTS tarefa (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION notify_tarefa_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'DELETE' THEN
        payload = json_build_object(
            'op', TG_OP,
            'data', json_build_object(
                'id', OLD.id
            )
        );
    ELSE
        payload = json_build_object(
            'op', TG_OP,
            'data', json_build_object(
                'id', NEW.id,
                'titulo', NEW.titulo,
                'descricao', NEW.descricao,
                'data_cadastro', NEW.data_cadastro,
                'data_atualizacao', NEW.data_atualizacao
            )
        );
    END IF;

    PERFORM pg_notify('tarefas', payload::text);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

