#!/usr/bin/env python3

from json import loads
from requests import get
from sys import argv, stderr, exit

def convert_btc_to_usd(btc_value):
    resp = get("https://api.coinbase.com/v2/prices/BTC-USD/buy")
    if resp.status_code == 200:
        resp_json = loads(resp.text)
        usdToBtc = float(resp_json["data"]["amount"])
        return usdToBtc * btc_value
    else:
        print("Coinbase request failed", stderr)

if __name__ == "__main__":
    if (len(argv) != 2):
        print("Pass BTC amount as parameter")
        exit(1)

    print(f"${convert_btc_to_usd(float(argv[1])):,.2f}")
