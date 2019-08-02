DROP TABLE transactions_blocks_headers_USDT;

CREATE TABLE transactions_blocks_headers_USDT (
  id bigserial,
  block_hash varchar(255) NULL DEFAULT NULL,
  block_number integer DEFAULT 0,
  nonce bigint DEFAULT 0,
  block_time timestamp DEFAULT NULL,
  block_confirmations integer DEFAULT 0,
  next_block varchar(255) NULL DEFAULT NULL,
  prev_block varchar(255) NULL DEFAULT NULL,
  _tx integer NOT NULL DEFAULT 0,
  _usdt integer NOT NULL DEFAULT 0,
  created_time timestamp DEFAULT current_timestamp,
  updated_time timestamp DEFAULT NULL,
  _removed_time timestamp DEFAULT NULL,
  _removed  smallint NOT NULL DEFAULT 0,
  _need_rescan_time timestamp DEFAULT NULL,
  _need_rescan smallint NOT NULL DEFAULT 0,
  UNIQUE(block_hash, block_number),
  PRIMARY KEY (id, block_number)
) PARTITION BY HASH (block_number);

CREATE TABLE transactions_blocks_headers_USDT_0 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 0);
CREATE TABLE transactions_blocks_headers_USDT_1 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 1);
CREATE TABLE transactions_blocks_headers_USDT_2 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 2);
CREATE TABLE transactions_blocks_headers_USDT_3 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 3);
CREATE TABLE transactions_blocks_headers_USDT_4 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 4);
CREATE TABLE transactions_blocks_headers_USDT_5 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 5);
CREATE TABLE transactions_blocks_headers_USDT_6 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 6);
CREATE TABLE transactions_blocks_headers_USDT_7 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 7);
CREATE TABLE transactions_blocks_headers_USDT_8 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 8);
CREATE TABLE transactions_blocks_headers_USDT_9 partition of transactions_blocks_headers_USDT FOR VALUES WITH (MODULUS 10, REMAINDER 9);
