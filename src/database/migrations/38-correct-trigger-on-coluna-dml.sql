CREATE OR REPLACE FUNCTION notify_coluna_changes()
RETURNS trigger AS $$
DECLARE
    payload json;
BEGIN
    IF TG_OP = 'DELETE' THEN
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'coluna',
            'data', json_build_object(
                'id', OLD.id
            )
        );
    ELSE
        payload = json_build_object(
            'op', TG_OP,
            'entity', 'coluna',
            'data', to_jsonb(NEW)
        );
    END IF;

    PERFORM pg_notify('colunas', payload::text);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coluna_insert_notify ON coluna;
DROP TRIGGER IF EXISTS trg_coluna_update_notify ON coluna;
DROP TRIGGER IF EXISTS trg_coluna_delete_notify ON coluna;

CREATE TRIGGER trg_coluna_insert_notify
AFTER INSERT ON coluna
FOR EACH ROW
EXECUTE FUNCTION notify_coluna_changes();

CREATE TRIGGER trg_coluna_update_notify
AFTER UPDATE ON coluna
FOR EACH ROW
EXECUTE FUNCTION notify_coluna_changes();

CREATE TRIGGER trg_coluna_delete_notify
AFTER DELETE ON coluna
FOR EACH ROW
EXECUTE FUNCTION notify_coluna_changes();