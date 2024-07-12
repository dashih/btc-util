#!/usr/bin/node

const execSync = require('child_process').execSync;

const updateInterval = 60;

var walletInBtc = 0;
var usdToBtc = 0;
var numInbound = 0;
var score = 0;
var count = 0;

async function update() {
    // Wallet data
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    usdToBtc = data['data']['amount'];
    const walletData = execSync('bitcoin-cli getwalletinfo').toString();
    walletInBtc = JSON.parse(walletData)['balance'];

    // Node/network data
    const nodeDataRaw = execSync('bitcoin-cli getnetworkinfo').toString();
    const nodeData = JSON.parse(nodeDataRaw);
    numInbound = nodeData['connections_in'];
    score = nodeData['localaddresses'][0]['score'];
}

function print() {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    process.stdout.write(`${formatter.format(usdToBtc * walletInBtc)} | ${walletInBtc} BTC | ${formatter.format(usdToBtc)} per BTC | ${numInbound} inbound peers | ${score} score (${count})`);
}

setInterval(async () => {
    if (count === 0) {
        await update();
        count = updateInterval;
    }

    process.stdout.cursorTo(0);
    print();
    process.stdout.clearLine(1);
    count--;
}, 1000);
