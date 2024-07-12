#!/usr/bin/node

const execSync = require('child_process').execSync;

(async () => {
    // Wallet data
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    const usdToBtc = data['data']['amount'];
    const walletData = execSync('bitcoin-cli getwalletinfo').toString();
    const walletInBtc = JSON.parse(walletData)['balance'];

    // Node/network data
    const nodeDataRaw = execSync('bitcoin-cli getnetworkinfo').toString();
    const nodeData = JSON.parse(nodeDataRaw);
    const numInbound = nodeData['connections_in'];
    const score = nodeData['localaddresses'][0]['score'];

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    console.log(`\x1b[32m${formatter.format(usdToBtc * walletInBtc)}\x1b[0m | \x1b[33m${walletInBtc} BTC\x1b[0m | ${formatter.format(usdToBtc)} per BTC | ${numInbound} inbound | ${score} score`);
})();
