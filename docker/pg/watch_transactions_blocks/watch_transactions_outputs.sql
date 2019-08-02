DROP TABLE transactions_blocks_list_outputs_USDT;

CREATE TABLE transactions_blocks_list_outputs_USDT (
  id bigint not null,
  inner_block_id bigint DEFAULT 0,
  block_number integer DEFAULT 0,
  transaction_hash varchar(255) NULL DEFAULT NULL,
  vout0 varchar(555) NULL DEFAULT NULL,
  vout_to_value double precision NOT NULL DEFAULT 0,
  vout_to_n  smallint NOT NULL DEFAULT 0,
  vout_to_asm varchar(255) NULL DEFAULT NULL ,
  vout_to_hex varchar(255) NULL DEFAULT NULL ,
  vout_to_req_sigs varchar(255) NULL DEFAULT NULL ,
  vout_to_type varchar(255) NULL DEFAULT NULL ,
  vout_to_addresses varchar(555) NULL DEFAULT NULL ,
  vout_spent  smallint NOT NULL DEFAULT 0,
  _scanned_spent integer NOT NULL DEFAULT 0,
  _scanned_spent_time timestamp  DEFAULT NULL,
  UNIQUE(transaction_hash, block_number),
  PRIMARY KEY (id, transaction_hash)
) PARTITION BY HASH (transaction_hash);

CREATE INDEX idx_transactions_blocks_list_outputs_USDT ON transactions_blocks_list_outputs_USDT(block_number);
CREATE INDEX idx_transactions_blocks_list_outputs_USDT2 ON transactions_blocks_list_outputs_USDT(_scanned_spent);
CREATE INDEX idx_transactions_blocks_list_outputs_USDT3 ON transactions_blocks_list_outputs_USDT(vout_spent);


CREATE TABLE transactions_blocks_list_outputs_USDT_0 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 0);
CREATE TABLE transactions_blocks_list_outputs_USDT_1 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 1);
CREATE TABLE transactions_blocks_list_outputs_USDT_2 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 2);
CREATE TABLE transactions_blocks_list_outputs_USDT_3 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 3);
CREATE TABLE transactions_blocks_list_outputs_USDT_4 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 4);
CREATE TABLE transactions_blocks_list_outputs_USDT_5 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 5);
CREATE TABLE transactions_blocks_list_outputs_USDT_6 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 6);
CREATE TABLE transactions_blocks_list_outputs_USDT_7 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 7);
CREATE TABLE transactions_blocks_list_outputs_USDT_8 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 8);
CREATE TABLE transactions_blocks_list_outputs_USDT_9 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 9);
CREATE TABLE transactions_blocks_list_outputs_USDT_10 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 10);
CREATE TABLE transactions_blocks_list_outputs_USDT_11 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 11);
CREATE TABLE transactions_blocks_list_outputs_USDT_12 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 12);
CREATE TABLE transactions_blocks_list_outputs_USDT_13 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 13);
CREATE TABLE transactions_blocks_list_outputs_USDT_14 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 14);
CREATE TABLE transactions_blocks_list_outputs_USDT_15 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 15);
CREATE TABLE transactions_blocks_list_outputs_USDT_16 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 16);
CREATE TABLE transactions_blocks_list_outputs_USDT_17 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 17);
CREATE TABLE transactions_blocks_list_outputs_USDT_18 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 18);
CREATE TABLE transactions_blocks_list_outputs_USDT_19 partition of transactions_blocks_list_outputs_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 19);
