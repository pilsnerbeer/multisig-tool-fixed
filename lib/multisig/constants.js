"use strict";

var constants = {
  M: 2,
  MINIMUM_MINER_FEE: 20000,
  BITCOIN_SATOSHIS: 100000000,
  INSIGHT_API_URL_ROOT: "https://api.blockcypher.com/v1/btc/main/addrs/",
  DEBUG: false,
  REQUEST_PIPELINE_SIZE: 2,
  REQUEST_BACKOFF: 250,
  REQUEST_BACKOFF_CEILING: 3000,
  REQUEST_BACKOFF_MULTIPLIER: 1.25,
  REQUEST_RETRY_ATTEMPTS: 5
}

module.exports = constants;
