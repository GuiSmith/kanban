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

DROP TRIGGER IF EXISTS trg_tarefa_insert_notify ON tarefa;
DROP TRIGGER IF EXISTS trg_tarefa_update_notify ON tarefa;
DROP TRIGGER IF EXISTS trg_tarefa_delete_notify ON tarefa;

CREATE TRIGGER trg_tarefa_insert_notify
AFTER INSERT ON tarefa
FOR EACH ROW
EXECUTE FUNCTION notify_tarefa_changes();

CREATE TRIGGER trg_tarefa_update_notify
AFTER UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION notify_tarefa_changes();

CREATE TRIGGER trg_tarefa_delete_notify
AFTER DELETE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION notify_tarefa_changes();

CREATE TABLE IF NOT EXISTS tarefa_arquivo (
  id SERIAL PRIMARY KEY,
  id_tarefa INT REFERENCES tarefa(id),
  nome VARCHAR(255) NOT NULL,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  public_url TEXT
);