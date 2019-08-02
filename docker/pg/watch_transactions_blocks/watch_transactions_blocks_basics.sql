DROP TABLE transactions_blocks_list_basics_USDT;

CREATE TABLE transactions_blocks_list_basics_USDT (
  id bigserial not null,
  inner_block_id bigint DEFAULT 0,
  block_number integer DEFAULT 0,
  transaction_hash varchar(255) NULL DEFAULT NULL,
  created_time timestamp DEFAULT current_timestamp,
  updated_time timestamp DEFAULT NULL,
  _removed_time timestamp DEFAULT NULL,
  _removed  smallint NOT NULL DEFAULT 0,
  _scanned integer NOT NULL DEFAULT 0,
  _scanned_time timestamp  DEFAULT NULL,
  _restored integer NOT NULL DEFAULT 0,
  _restored_time timestamp DEFAULT NULL,
  UNIQUE(transaction_hash, inner_block_id, block_number),
  PRIMARY KEY (id, block_number)
) PARTITION BY HASH (block_number);

CREATE INDEX idx_transactions_blocks_list_basics_USDT ON transactions_blocks_list_basics_USDT(_scanned);
CREATE INDEX idx_transactions_blocks_list_basics_USDT2 ON transactions_blocks_list_basics_USDT(inner_block_id);

CREATE TABLE transactions_blocks_list_basics_USDT_0 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 0);
CREATE TABLE transactions_blocks_list_basics_USDT_1 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 1);
CREATE TABLE transactions_blocks_list_basics_USDT_2 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 2);
CREATE TABLE transactions_blocks_list_basics_USDT_3 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 3);
CREATE TABLE transactions_blocks_list_basics_USDT_4 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 4);
CREATE TABLE transactions_blocks_list_basics_USDT_5 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 5);
CREATE TABLE transactions_blocks_list_basics_USDT_6 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 6);
CREATE TABLE transactions_blocks_list_basics_USDT_7 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 7);
CREATE TABLE transactions_blocks_list_basics_USDT_8 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 8);
CREATE TABLE transactions_blocks_list_basics_USDT_9 partition of transactions_blocks_list_basics_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 9);
