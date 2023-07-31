"use strict";

const constants = require('./constants');
const queue = [];
const requestInterval = 2000;

var Insight = {
  lastRequestTime: 0,

  getTransaction: function (txHash) {
    return new Promise(function (resolve, reject) {
      $.get('https://api.blockcypher.com/v1/btc/main/txs/' + txHash)
        .done(resolve)
        .fail(reject);
    });
  },

  getUnspentOutputs: function (address) {
    return this.queueRequest(() => this.get(address));
  },
  get: function (url) {
    return new Promise((resolve, reject) => {
      $.get(constants.INSIGHT_API_URL_ROOT + url)
        .done(resolve)
        .fail(reject);
    });
  },
  queueRequest: function (requestFn) {
    // Ensure there is a delay of at least 2000 ms between each request because of API limits
    const delay = Math.max(0, this.lastRequestTime + 2000 - Date.now());
    this.lastRequestTime = Date.now() + delay;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        requestFn().then(resolve).catch(reject);
      }, delay);
    });
  },
}

module.exports = Insight;
