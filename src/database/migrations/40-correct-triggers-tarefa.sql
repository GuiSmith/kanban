CREATE OR REPLACE FUNCTION notify_tarefa_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'DELETE' THEN
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'tarefa',
            'data', json_build_object(
                'id', OLD.id
            )
        );
    ELSE
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'tarefa',
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