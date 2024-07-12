#!/usr/bin/node

const execSync = require('child_process').execSync;

(async () => {
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    const usdToBtc = data['data']['amount'];
    const walletData = execSync('bitcoin-cli getwalletinfo').toString();
    const walletInBtc = JSON.parse(walletData)['balance'];
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    console.log(`${walletInBtc} BTC`);
    console.log(formatter.format(usdToBtc * walletInBtc));
})();
