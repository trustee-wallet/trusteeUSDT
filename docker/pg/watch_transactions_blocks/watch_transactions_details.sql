DROP TABLE transactions_blocks_list_details_USDT;

CREATE TABLE transactions_blocks_list_details_USDT (
  id bigint not null,
  inner_block_id bigint DEFAULT 0,
  block_number integer DEFAULT 0,
  transaction_block_number integer DEFAULT 0,
  transaction_block_hash varchar(255) NULL DEFAULT NULL,
  transaction_hash varchar(255) NULL DEFAULT NULL,
  transaction_txid varchar(255) NULL DEFAULT NULL,
  from_address varchar(255) NULL DEFAULT NULL,
  to_address varchar(255) NULL DEFAULT NULL ,
  amount double precision NOT NULL DEFAULT 0,
  fee double precision NOT NULL DEFAULT 0,
  custom_type varchar(255) NULL DEFAULT NULL ,
  custom_valid  smallint NOT NULL DEFAULT 0,
  created_time timestamp DEFAULT current_timestamp,
  updated_time timestamp DEFAULT NULL,
  removed_time timestamp DEFAULT NULL,
  _removed  smallint NOT NULL DEFAULT 0,
  _scanned_output integer NOT NULL DEFAULT 0,
  _scanned_output_time timestamp  DEFAULT NULL,
  UNIQUE(transaction_hash, block_number),
  PRIMARY KEY (id, transaction_hash)
) PARTITION BY HASH (transaction_hash);

CREATE INDEX idx_transactions_blocks_list_details_USDT ON transactions_blocks_list_details_USDT(transaction_block_number);
CREATE INDEX idx_transactions_blocks_list_details_USDT2 ON transactions_blocks_list_details_USDT(from_address);
CREATE INDEX idx_transactions_blocks_list_details_USDT3 ON transactions_blocks_list_details_USDT(to_address);
CREATE INDEX idx_transactions_blocks_list_details_USDT4 ON transactions_blocks_list_details_USDT(_scanned_output);
CREATE INDEX idx_transactions_blocks_list_details_USDT5 ON transactions_blocks_list_details_USDT(custom_valid);
CREATE INDEX idx_transactions_blocks_list_details_USDT6 ON transactions_blocks_list_details_USDT(block_number);


CREATE TABLE transactions_blocks_list_details_USDT_0 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 0);
CREATE TABLE transactions_blocks_list_details_USDT_1 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 1);
CREATE TABLE transactions_blocks_list_details_USDT_2 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 2);
CREATE TABLE transactions_blocks_list_details_USDT_3 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 3);
CREATE TABLE transactions_blocks_list_details_USDT_4 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 4);
CREATE TABLE transactions_blocks_list_details_USDT_5 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 5);
CREATE TABLE transactions_blocks_list_details_USDT_6 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 6);
CREATE TABLE transactions_blocks_list_details_USDT_7 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 7);
CREATE TABLE transactions_blocks_list_details_USDT_8 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 8);
CREATE TABLE transactions_blocks_list_details_USDT_9 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 9);
CREATE TABLE transactions_blocks_list_details_USDT_10 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 10);
CREATE TABLE transactions_blocks_list_details_USDT_11 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 11);
CREATE TABLE transactions_blocks_list_details_USDT_12 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 12);
CREATE TABLE transactions_blocks_list_details_USDT_13 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 13);
CREATE TABLE transactions_blocks_list_details_USDT_14 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 14);
CREATE TABLE transactions_blocks_list_details_USDT_15 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 15);
CREATE TABLE transactions_blocks_list_details_USDT_16 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 16);
CREATE TABLE transactions_blocks_list_details_USDT_17 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 17);
CREATE TABLE transactions_blocks_list_details_USDT_18 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 18);
CREATE TABLE transactions_blocks_list_details_USDT_19 partition of transactions_blocks_list_details_USDT FOR VALUES WITH (MODULUS 20, REMAINDER 19);
