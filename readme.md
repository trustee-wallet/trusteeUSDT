# How to start

set your nodes urls here - microtrustee/micro_configs/BlockchainNodes.js

## How to build

docker build -t blocksoft/microtrustee .

docker-compose stop && docker-compose down && docker-compose up -d

### When first start - go to DB and import SQLs

SQLs in docker/pg/watch_transactions_blocks should be runned manually (also may use external db not from container)

## How to watch running

docker-compose ps

docker logs microtrustee

docker exec -t microtrustee /bin/bash -c "pm2 status"

or call api https://{YOUR_SERVER}/txs/1M3UGxPamLgQvWTzM2V2Tk1d5JRmWkXVAA 

## How to get errors on production

set your bot api key and tg user ids here - microtrustee/micro_configs/Settings.js




# Testing and development

## Mass starts

docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_blocks/all.config.js"

docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_details/all.config.js"

docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_outputs/all.config.js"

### Fast blocks loading - only for db first data

docker exec -t microtrustee /bin/bash -c "pm2 start /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fast.config.js"

## Manual test 

docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_blocks/watch_transactions_fast_blocks.js USDT 0 10000"

docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_details/watch_transactions_details.js USDT"

docker exec -t microtrustee /bin/bash -c "node /usr/microtrustee/micro_workers/watch_transactions_outputs/watch_transactions_outputs.js USDT"


## Used forked NodeJS modules )

docker exec -t microtrustee /bin/bash -c "npm install --unsafe-perm --global Turtus/node-pg-format"
