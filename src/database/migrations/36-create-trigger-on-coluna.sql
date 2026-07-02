CREATE OR REPLACE FUNCTION criar_colunas_padrao_espaco()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO coluna (id_espaco, nome, tipo, ordem)
    VALUES
        (NEW.id, 'A FAZER',  'A FAZER',  1),
        (NEW.id, 'FAZENDO',  'FAZENDO',  2),
        (NEW.id, 'FEITO',    'FEITO',    3);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_criar_colunas_padrao_espaco ON espaco;

CREATE TRIGGER trg_criar_colunas_padrao_espaco
AFTER INSERT ON espaco
FOR EACH ROW
EXECUTE FUNCTION criar_colunas_padrao_espaco();