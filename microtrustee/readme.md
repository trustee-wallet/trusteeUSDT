# Actual code

## micro_common

Common libraries, db pools, error handling and notifications 

+ Blockchain libs (rpc and transformers) for unification different blockchains data to one db structure


## micro_configs

Settings

## micro_cron

Cron jobs and pm2 starting list that will be executed on code container run

## micro_workers

Main code - jobs that are done to scan and process different blockchains

### step1: watch_transactions_blocks

Jobs group for scanning blocks
- one by one in usual script 
- or fast mode in few threads without rechecking for historical data
Fills table of blocks and transactions hashes (without details - for most btc based blockchains each tx hash
detail is separate call, so just store and scan in next step)

### step2: watch_transactions_details

Jobs for scanning transactions details in few threads - stores from, to, value and other fields in rational
db table that could be searched and indexed any way we need

### step3: watch_transactions_outputs

Special BTC jobs for USDT - for scanned and valid tx from step2 - adds correspond btc outputs 
