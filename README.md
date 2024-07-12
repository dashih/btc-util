# btc-util
Learnings and helper scripts running Bitcoin Core as of July 2024

## daemon, CLI, and GUI
Bitcoin Core is the de facto standard that miners and nodes use to maintain the BTC blockchain. The project releases a daemon (`bitcoind`), a CLI (`bitcoin-cli`), and a QT-based GUI (`bitcoin-qt`). `bitcoin-qt` appears to package its own backend and cannot use an already-running `bitcoind`. `bitcoin-cli` can run against either `bitcoind` or a `bitcoin-qt`.

`bitcoin-qt` offers some niceties like QR codes, and honestly, you just want a real UI for a wallet. The only disadvantage is it does not support programmatically toggling full node functionality. So if you're running short on ISP bandwidth, you're better off using `bitcoind` and cron to schedule it.

## Distro and desktop
KDE Neon, currently presenting Plasma 6 and based on Ubuntu 22.04 LTS, can run `bitcoin-qt` out-of-the-box. And it is quite snazzy, so I find it satisfactory for use on both an online/hot and offline/cold host.

## Configuration
`~/.bitcoin/bitcoin.conf` configures `bitcoind` and `bitcoin-cli`:

```
datadir=/mnt/blockchain
walletdir=/mnt/wallets
```

`bitcoin-qt` also uses a `bitcoin.conf` file, but not the one above for some dumb reason. The one it respects it buried away, so it's probably easier to use command-line arguments:

```
bitcoin-qt -datadir=/mnt/blockchain -walletdir=/mnt/wallets -server
```

Note that `-server` causes it to serve the JSON-RPC API, allowing for interaction using `bitcoin-cli`. This is handy for scripts even if you mostly use the UI.

Lastly, on KDE, you can use the `Menu Editor` application to create a launcher with the above command and args, and pin it to the task manager.

## Initial Block Download (IBD)
This takes forever as the entire blockchain must be downloaded and processed. As of June 2024, it is taking 625 GB. The process can be sped up dramatically by increasing Bitcoin Core's database cache memory size.

Use the daemon executable. Allocate as much RAM as you can spare and add this configuration to `bitcoin.conf`:
```
dbcache=16384
```

## Contributing a full node
Port 8333 must be routable for your full node to service incoming connections. So that port will need to be let through the firewalls (edge and system), and the IPv4 address will need to be NAT'd. As such, static addressing is likely in order.

The IP addresses do not have to be registered anywhere, however; the BTC network will spread the word. So there's no need for external DNS either, unless you want to be able to easily configure an application (like a Lightning wallet) to specifically use this node.

## Cold wallet
An interesting setup supported by Bitcoin Core is to run a pair of wallets, one cold and one hot. The cold wallet contains full BTC addresses including the private keys needed to sign sends. It is air-gapped, i.e. never exposed to the Internet or any network. The hot wallet runs on a Bitcoin Core Full Node but only contains partial BTC addresses (just the public keys). It can only receive BTC.

The configuration involves using Bitcoin Core Descriptors, which can be thought of as seeds with which a wallet can generate a range of addresses. To setup:
1. Run Bitcoin Core on the cold machine. It does not matter what the datadir is, since there's no network to sync from anyway.
2. Create a normal wallet and encrypt it with a string passphrase.
3. Using the CLI or the Console option in the GUI, run `listdescriptors`. This will ouput a JSON array of descriptors, each of which is for a different kind of address. For native segwit (bech32), we want the two `wpkh([...84h/0h/0h]` descriptors. One is for generating receive addresses and the other for change addresses. Copy those two descriptors, add square brackets to keep the json an array, and remove all newlines (on Kubuntu, Kate has a handy shortcut: Ctrl-J).
4. Transfer this descriptor string to the hot wallet machine.
5. Create a `Disable Private Keys` wallet on the hot wallet machine. Since this wallet does not contain secrets, we can forego the encryption.
6. Using the CLI or Console, run `importdescriptors` with the descriptor string as an argument. Since the descriptor string contains double quotes, wrap the entire string with single quotes.
7. Create a few receive addresses on both the cold and hot wallets and verify they match. If they do, you are good to receive BTC on any of those addresses now.

To send BTC:
1. Initiate the send transaction on the hot wallet. The GUI helpfully has a `Create Unsigned` button which verifies the wallet does not contain the sensitive private keys.
2. Save the PSBT file and transfer to the cold wallet.
3. Load the PSBT file on the cold wallet and sign the transaction. This step verifies that the "change" descriptor was successfully imported to the hot wallet.
4. Transfer the signed PSBT file to the hot wallet.
5. Load the PSBT and broadcast it. This completes the send.
