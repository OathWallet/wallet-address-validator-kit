#!/usr/bin/env bash
set -euo pipefail

node ../../bin/walletaddrcheck.js address 1BoatSLRHtKNngkdXEeobR76b53LETtpyT --chain bitcoin >/dev/null
node ../../bin/walletaddrcheck.js address 0x52908400098527886E0F7030069857D2E4169EE7 --chain ethereum --strict-checksum >/dev/null
node ../../bin/walletaddrcheck.js address 11111111111111111111111111111111 --chain solana >/dev/null
node ../../bin/walletaddrcheck.js list-chains >/dev/null

echo "cli-example-ok"
