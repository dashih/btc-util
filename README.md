# btc-util
Learnings and helper scripts running Bitcoin Core

## daemon, CLI, and GUI
Bitcoin Core is the official software that miners and nodes use to maintain the BTC blockchain. The project releases a daemon (`bitcoind`), a CLI (`bitcoin-cli`), and a QT-based GUI (`bitcoin-qt`). You might think that the daemon is shared; that once running, the CLI and GUI can both interface against it. However, as of June 2024, this is not the case. Only the CLI can work with `bitcoind`. The GUI actually starts its own daemon - not sure how/if it is different from `bitcoind`. Furthermore, the CLI and GUI cannot both run at the same time against the same data directory.

I have found `bitcoind` to be more stable to run as a full node. It is also easier to manage a schedule with it. Annoyingly however, it must be shutdown to use the GUI, which is much more convenient to actually perform transactions.

Kubuntu 24.04 Live and minimal installation can run `bitcoin-qt` without additional dependencies being installed.

## Configuration
`bitcoind` configuration is in `~/.bitcoin/bitcoin.conf`, which is standard for *nix systems according to the documentation. This configuration file may be used to set the datadir and wallet dir:

```
datadir=/mnt/blockchain
walletdir=/mnt/wallets
```

On Kubuntu 24.04, `bitcoin-qt` configuration is in `~/.config/Bitcoin/Bitcoin-Qt.conf`, which is undocumented. Much easier to configure the GUI with command-line parameters at launch:

```
bitcoin-qt -datadir=/mnt/blockchain -walletdir=/mnt/wallets -server
```

## Initial Block Download (IBD)
This takes forever as the entire blockchain must be downloaded and processed. As of Juen 2024, it is taking 625 GB. The process can be sped up dramatically by increasing Bitcoin Core's database cache memory size.

Use the daemon executable. Allocate as much RAM as you can spare and add this configuration to `bitcoin.conf`:
```
dbcache=16384
```

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
