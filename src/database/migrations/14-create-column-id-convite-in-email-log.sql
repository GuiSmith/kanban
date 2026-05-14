ALTER TABLE espaco_convite DROP COLUMN id_email_log;

ALTER TABLE email_log ADD COLUMN id_convite INT REFERENCES espaco_convite(id);