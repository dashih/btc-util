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

    console.log(`${formatter.format(usdToBtc * walletInBtc)} | ${walletInBtc} BTC | ${formatter.format(usdToBtc)} per BTC | ${numInbound} inbound peers | ${score} score (${count})`);
})();