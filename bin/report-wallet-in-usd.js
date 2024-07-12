#!/usr/bin/node

const execSync = require('child_process').execSync;

const updateInterval = 60;

var walletInBtc = 0;
var usdToBtc = 0;
var count = 0;

async function update() {
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    usdToBtc = data['data']['amount'];
    const walletData = execSync('bitcoin-cli getwalletinfo').toString();
    walletInBtc = JSON.parse(walletData)['balance'];
}

function print() {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    process.stdout.write(`${walletInBtc} BTC | ${formatter.format(usdToBtc * walletInBtc)} | ${formatter.format(usdToBtc)} per BTC (${count})`);
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
