CREATE OR REPLACE FUNCTION notify_tarefa_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'DELETE' THEN
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'tarefa',
            'id_espaco', OLD.id_espaco,
            'data', json_build_object(
                'id', OLD.id
            )
        );
    ELSE
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'tarefa',
            'id_espaco', NEW.id_espaco,
            'data', to_jsonb(NEW)
        );
    END IF;

    PERFORM pg_notify('tarefas', payload::text);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_coluna_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'DELETE' THEN
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'coluna',
            'id_espaco', OLD.id_espaco,
            'data', json_build_object(
                'id', OLD.id
            )
        );
    ELSE
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'coluna',
            'id_espaco', NEW.id_espaco,
            'data', to_jsonb(NEW)
        );
    END IF;

    PERFORM pg_notify('tarefas', payload::text);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
