"use strict";

// Dependencies.
var Bitcoin = require('bitcoinjs-lib');
var Insight = require('./insight');
var constants = require('./constants');
var utils = require('./utils');


/***
Address */
var Address = function (index, masterNodes) {
  this.fetched = false;
  this.failed = false;
  this.balance = 0;
  this.index = index;
  this.unspentOutputs = [];
  this.masterNodes = masterNodes;

  if (constants.DEBUG) console.log('Initializing address', index, 'master nodes', masterNodes);

  // Fetch unspent outputs.
  this.initialize();
}
Address.prototype = {
  initialize: function () {
    if (this.initializing) return this.initializing.promise();

    this.initializing = new $.Deferred();

    // Things that need to happen before we declare we're initialized.
    $.when(
      this.generate(),
      this.getUnspentOutputs()
    ).
      then(this.initializing.resolve);

    return this.initializing.promise();
  },
  generate: function () {
    if (this.generating) return this.generating.promise();

    this.generating = new $.Deferred();

    // Do this async, to not block rendering.
    setTimeout(function () {
      // Derive the child pubkey for each master node.
      var pubkeys = this.masterNodes.map(function (node) {
        var pubKey = node.hd_node.derive(this.index).pubKey;

        // We get information about whether a certain master key should be compressed or uncompressed from Coinbase.com
        // through URL parameters, like compressed[]=1&compressed[]=2 would signal that xpubkey1's and xpubkey2's children
        // should all be compressed, whereas xpubkey3's children should be uncompressed.
        if (!node.compressed) {
          return new Bitcoin.ECPubKey(pubKey.Q, false); // Uncompress key if necessary.
        }

        return pubKey;
      }.bind(this));

      this.pubkeys = pubkeys.sort(this.comparePubKeys); // Sort them by their hex values.

      if (constants.DEBUG) console.log('Generating address', this.pubkeys);

      // Generate the redeemScript.
      this.redeemScript = Bitcoin.scripts.multisigOutput(constants.M, this.pubkeys); // M of N;

      // Generate the multisig address for this redeem script.
      var scriptPubKey = Bitcoin.scripts.scriptHashOutput(this.redeemScript.getHash());
      this.address = Bitcoin.Address.fromOutputScript(scriptPubKey).toString();

      this.generating.resolve(this.address);
    }.bind(this), 0);

    return this.generating.promise();
  },
  getUnspentOutputs: function () {
    this.fetched = false;
    this.failed = false;
    if (this.getting) return this.getting.promise();

    this.getting = new $.Deferred();

    // Wait for address to be generated before attempting to fetch its outputs.
    var that = this;
    this.generate().done(function () {
      // Call Insight.
      Insight.getUnspentOutputs(that.address)
        .done(function (response) {
          that.setUnspentOutputs(response, that.getting);
        })
        .fail(function () {
          that.failed = true;
          that.getting.reject();
        });
    });

    return this.getting.promise();
  },
  setUnspentOutputs: function (response, promise) {
    this.fetched = true;

    if (!response) {
      promise.resolve();
      return;
    }
    if (!response.txrefs || response.txrefs.length < 1) {
      promise.resolve();
      return;
    }

    var that = this;
    var txHashes = response.txrefs
      .filter(function (output) {
        return !output.spent;
      })
      .map(function (output) {
        return output.tx_hash;
      });

    var unspentOutputs = response.txrefs
      .filter(function (output) {
        return !output.spent;
      })
      .map(function (output) {
        return {
          hash: output.tx_hash,
          index: output.tx_output_n,
          amount: output.value,
          script: null
        };
      });

    var scriptPromises = [];

    txHashes.forEach(function (txHash, index) {
      var scriptPromise = Insight.getTransaction(txHash).then(function (transaction) {
        unspentOutputs[index].script = Bitcoin.Script.fromHex(transaction.outputs[unspentOutputs[index].index].script);
      });
      scriptPromises.push(scriptPromise);
    });

    Promise.all(scriptPromises)
      .then(function () {
        that.unspentOutputs = unspentOutputs;
        that.updateBalance();
    
        promise.resolve();
      })
      .catch(function () {
        that.failed = true;
        promise.reject();
      });
  },
  updateBalance: function () {
    this.balance = this.unspentOutputs.reduce(function (total, output) {
      return total += output.amount;
    }, 0.0);
  },
  getPrvKey: function (node) {
    return node.derive(this.index).privKey;
  },
  comparePubKeys: function (a, b) {
    if (a.toHex() < b.toHex()) return -1;
    if (b.toHex() < a.toHex()) return 1;
    return 0;
  }
}

module.exports = Address;
