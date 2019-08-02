DROP TABLE transactions_work;

CREATE TABLE transactions_work(
  my_key varchar(255) NULL DEFAULT NULL,
  my_val varchar(255) NULL DEFAULT NULL,
  my_json jsonb NULL DEFAULT NULL,
  PRIMARY KEY (my_key)
);

CREATE INDEX idx_transactions_work ON transactions_work USING GIN (my_json);
