#!/usr/bin/node

const execSync = require('child_process').execSync;

(async () => {
    // Wallet data
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    const usdToBtc = data['data']['amount'];
    const walletData = execSync('bitcoin-cli getwalletinfo').toString();
    const walletInBtc = JSON.parse(walletData)['balance'];

    // Gains/loss
    const costBasis = 67809.13;
    const walletInUsd = usdToBtc * walletInBtc;
    const change = walletInUsd - costBasis;
    const changePerc = (walletInUsd - costBasis) / costBasis;

    // Node/network data
    const nodeDataRaw = execSync('bitcoin-cli getnetworkinfo').toString();
    const nodeData = JSON.parse(nodeDataRaw);
    const numInbound = nodeData['connections_in'];
    const score = nodeData['localaddresses'][0]['score'];

    // Uptime
    const nodeUptimeS = parseInt(execSync('bitcoin-cli uptime').toString());
    const uptimeDays = Math.floor(nodeUptimeS / (24 * 60 * 60));
    const remainingS = nodeUptimeS % (24 * 60 * 60);
    const uptimeRemainingHours = Math.floor(remainingS / (60 * 60));

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    // Pretty print
    let changePrint = `${formatter.format(change)}`;
    const changePercPrint = `${(changePerc * 100).toFixed(1)}%`;
    if (change > 0) {
        changePrint = `\x1b[92m+${changePrint} (+${changePercPrint})\x1b[0m`;
    } else {
        changePrint = `\x1b[91m${changePrint} (${changePercPrint}%)\x1b[0m`;
    }

    const currentValue = `\x1b[93m${formatter.format(walletInUsd)}\x1b[0m`;
    console.log(`${currentValue} (${walletInBtc} BTC) | ${changePrint} | ${formatter.format(usdToBtc)} per BTC`);
    console.log(`${uptimeDays} days ${uptimeRemainingHours} hours | ${numInbound} inbound | ${score} score`);
})();
