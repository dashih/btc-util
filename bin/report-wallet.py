#!/usr/bin/env python3

from convert_btc_to_usd import convert_btc_to_usd
from json import loads
from subprocess import check_output

cost_basis = 67809.13

usd_to_btc = convert_btc_to_usd(2)

wallet_data = check_output("bitcoin-cli getwalletinfo", shell=True, text=True)
wallet_in_btc = loads(wallet_data)["balance"]
wallet_in_usd = usd_to_btc * wallet_in_btc
change = wallet_in_usd - cost_basis
change_perc = (wallet_in_usd - cost_basis) / cost_basis

network_node_data = check_output("bitcoin-cli getnetworkinfo", shell=True, text=True)
network_node_json = loads(network_node_data)
num_inbound = network_node_json["connections_in"]
score = network_node_json["localaddresses"][0]["score"]

uptime = check_output("bitcoin-cli uptime", shell=True, text=True)