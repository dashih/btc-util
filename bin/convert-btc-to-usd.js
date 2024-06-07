#!/usr/bin/node

if (process.argv.length !== 3) {
    console.log('Pass BTC amount as parameter');
    process.exit(1);
}

(async () => {
    const resp = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy');
    const data = await resp.json();
    const usdToBtc = data['data']['amount'];
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });
    console.log(formatter.format(usdToBtc * process.argv[2]));
})();
