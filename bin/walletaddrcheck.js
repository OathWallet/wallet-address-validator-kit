#!/usr/bin/env node
import { validateAddress, listChains } from "../src/index.js";

function usage(exitCode = 0) {
  const text = `walletaddrcheck

Usage:
  walletaddrcheck address <address> [--chain bitcoin] [--strict-checksum] [--pretty]
  walletaddrcheck list-chains [--pretty]

Examples:
  walletaddrcheck address 1BoatSLRHtKNngkdXEeobR76b53LETtpyT --chain bitcoin --pretty
  walletaddrcheck address 0x52908400098527886E0F7030069857D2E4169EE7 --chain ethereum --strict-checksum --pretty
  walletaddrcheck address 11111111111111111111111111111111 --chain solana --pretty
`;
  process.stdout.write(text);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item === "--pretty") args.pretty = true;
    else if (item === "--strict-checksum") args.strictChecksum = true;
    else if (item === "--chain") args.chain = argv[++index];
    else if (item === "--help" || item === "-h") args.help = true;
    else args._.push(item);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || args._.length === 0) usage(0);

const command = args._[0];
let output;

if (command === "list-chains") {
  output = listChains();
} else if (command === "address") {
  const address = args._[1];
  if (!address) usage(1);
  output = validateAddress(address, {
    chain: args.chain,
    strictChecksum: args.strictChecksum
  });
  if (!output.valid) process.exitCode = 1;
} else {
  usage(1);
}

process.stdout.write(args.pretty ? `${JSON.stringify(output, null, 2)}\n` : `${JSON.stringify(output)}\n`);
