#!/usr/bin/env python3

from convert_btc_to_usd import convert_btc_to_usd
from json import loads
from subprocess import check_output

cost_basis = 67809.13

wallet_data = check_output("bitcoin-cli getwalletinfo", shell=True, text=True)
wallet_in_btc = loads(wallet_data)["balance"]
usd_to_btc = convert_btc_to_usd(1)
wallet_in_usd = wallet_in_btc * usd_to_btc
change = wallet_in_usd - cost_basis
change_perc = (wallet_in_usd - cost_basis) / cost_basis

network_node_data = check_output("bitcoin-cli getnetworkinfo", shell=True, text=True)
network_node_json = loads(network_node_data)
num_inbound = network_node_json["connections_in"]
score = network_node_json["localaddresses"][0]["score"]

uptime_s = int(check_output("bitcoin-cli uptime", shell=True, text=True))
days = uptime_s // (24 * 60 * 60)
remaining_s = uptime_s % (24 * 60 * 60)
hours = remaining_s // (60 * 60)
remaining_s = remaining_s % (60 * 60)
mins = remaining_s // 60

# Colors
change_print = f"${change:,.2f}"
if change > 0:
    change_print = f"\x1b[92m+{change_print} (+{round(change_perc * 100, 2)}%)\x1b[0m"
else:
    change_print = f"\x1b[91m${change_print} ({round(change_perc * 100, 2)}%)\x1b[0m"

wallet_in_usd_print = f"\x1b[93m${wallet_in_usd:,.2f}\x1b[0m"

# Final output
print(f"{wallet_in_usd_print} ({wallet_in_btc} BTC) | {change_print} | ${usd_to_btc:,.2f} per BTC")
print(f"{days}d {hours}h {mins}m | {num_inbound} inbound | {score} score")
