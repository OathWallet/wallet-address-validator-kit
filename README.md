# Wallet Address Validator Kit

Wallet Address Validator Kit validates blockchain wallet addresses offline across JavaScript/Node, Swift, Python, Go, Rust, Dart/Flutter, and Kotlin.

GitHub is the canonical source of truth:

```text
https://github.com/devdasx/wallet-address-validator-kit
```

## What it validates

- Bitcoin Base58Check P2PKH/P2SH addresses.
- Bitcoin native SegWit and Taproot addresses using BIP-173 Bech32 and BIP-350 Bech32m.
- Ethereum and EVM addresses with optional strict EIP-55 checksum enforcement.
- Solana 32-byte base58 account/PDA addresses.
- Dogecoin, Litecoin, Dash, DigiByte, TRON, and Zcash transparent Base58Check addresses.
- Litecoin and DigiByte native SegWit Bech32 addresses.
- Bitcoin Cash CashAddr addresses with or without prefix.
- Cosmos-style Bech32 account addresses for Cosmos, Osmosis, Juno, and Terra.
- Cardano Bech32 address/stake HRP syntax.
- Automatic address detection across supported chains.

## Install

Install from GitHub:

```bash
npm install github:devdasx/wallet-address-validator-kit#0.2.1
```

When npm registry publishing is configured:

```bash
npm install wallet-address-validator-kit
```

The npm package is designed to be published from GitHub releases. Add an npm automation token as the repository secret `NPM_TOKEN`; after that, published GitHub releases trigger `.github/workflows/npm-publish.yml` and npm receives the package built from the tagged GitHub source.

Use the CLI without installing globally:

```bash
npx github:devdasx/wallet-address-validator-kit#0.2.1 walletaddrcheck address 1BoatSLRHtKNngkdXEeobR76b53LETtpyT --chain bitcoin --pretty
```

## JavaScript API

```js
import {
  listChains,
  validateAddress,
  validateBitcoinAddress,
  validateEthereumAddress
} from "wallet-address-validator-kit";

const bitcoin = validateBitcoinAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT");

const ethereum = validateEthereumAddress(
  "0x52908400098527886E0F7030069857D2E4169EE7",
  { strictChecksum: true }
);

const solana = validateAddress(
  "11111111111111111111111111111111",
  { chain: "solana" }
);

const detected = validateAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty");

console.log(bitcoin.valid, ethereum.valid, solana.valid, detected.possibleChains);
console.log(listChains());
```

## CLI

```bash
walletaddrcheck address 1BoatSLRHtKNngkdXEeobR76b53LETtpyT --chain bitcoin --pretty
walletaddrcheck address bc1pqypqxpq9qcrsszg2pvxq6rs0zqg3yyc5z5tpwxqergd3c8g7rusqwk0jyn --chain bitcoin --pretty
walletaddrcheck address 0x52908400098527886E0F7030069857D2E4169EE7 --chain ethereum --strict-checksum --pretty
walletaddrcheck address 11111111111111111111111111111111 --chain solana --pretty
walletaddrcheck address D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1 --chain dogecoin --pretty
walletaddrcheck address LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd --chain litecoin --pretty
walletaddrcheck list-chains --pretty
```

## Supported chains and formats

| Chain id | Formats |
| --- | --- |
| `bitcoin` | Base58Check P2PKH/P2SH, Bech32 SegWit, Bech32m Taproot |
| `litecoin` | Base58Check P2PKH/P2SH, Bech32 SegWit |
| `dogecoin` | Base58Check P2PKH/P2SH |
| `dash` | Base58Check P2PKH/P2SH |
| `digibyte` | Base58Check P2PKH/P2SH, Bech32 SegWit |
| `bitcoin-cash` | CashAddr and legacy Base58Check |
| `zcash` | transparent Base58Check |
| `ethereum`, `polygon`, `bsc`, `avalanche-c`, `arbitrum`, `optimism`, `base` | EVM hex address, EIP-55 optional strict checksum |
| `tron` | Base58Check account address |
| `solana` | base58 32-byte account/PDA address |
| `cosmos`, `osmosis`, `juno`, `terra` | Bech32 account address |
| `cardano` | Bech32 address/stake HRP syntax |

## Language packages

This repository contains real package entry points for:

- JavaScript / Node.js: `package.json`, `src/index.js`, CLI `walletaddrcheck`.
- Swift / iOS / macOS: `Package.swift`, `Sources/WalletAddressValidatorKit`, `WalletAddressValidatorKit.podspec`.
- Python: `pyproject.toml`, `python/wallet_address_validator_kit`.
- Go: `go.mod`, `addressvalidator.go`.
- Rust: `Cargo.toml`, `src/lib.rs`.
- Dart / Flutter: `pubspec.yaml`, `lib/wallet_address_validator_kit.dart`.
- Kotlin / JVM / Android-compatible core: Gradle build, `src/main/kotlin`.

GitHub tags are the canonical install source. Registry publishing for npm, PyPI, crates.io, pub.dev, Maven Central, and CocoaPods requires the relevant account tokens.

## Examples

Run real examples:

```bash
npm install
examples/run-examples.sh
```

See:

- [`examples/node`](examples/node)
- [`examples/cli`](examples/cli)

## Validation

Run tests:

```bash
npm test
swift test
PYTHONPATH=python python3 -m unittest discover -s python/tests
go test ./...
cargo test
dart test
gradle test
```

The test suite verifies:

- Bitcoin Base58Check checksum rejection.
- Bitcoin Bech32 SegWit and Bech32m Taproot validation.
- Ethereum EIP-55 checksum validation.
- Solana 32-byte base58 validation.
- Litecoin, Dogecoin, Dash, DigiByte, TRON, and Zcash address prefix validation.
- Bitcoin Cash CashAddr validation.
- Cosmos-style Bech32 account validation.
- Cardano Bech32 HRP validation.
- Automatic chain detection.

## Security notes

- This package validates address syntax, checksum, prefix, HRP, and payload length. It does not prove ownership, funds, or chain activity.
- Address validation is offline and does not call blockchain APIs.
- Some address formats are intentionally ambiguous between chains. Pass `chain` when a specific network matters.

## Standards used

- [BIP-173 Bech32 native SegWit addresses](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki)
- [BIP-350 Bech32m for SegWit v1+](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki)
- [EIP-55 mixed-case Ethereum checksum](https://eips.ethereum.org/EIPS/eip-55)
- [Solana account address documentation](https://solana.com/docs/core/accounts/account-structure)

## AI-agent readability

This repository includes:

- `README.md` with install commands and examples.
- `llms.txt` for concise retrieval by AI agents.
- `docs/llms.txt` and `docs/llms-full.txt` for GitHub Pages.
- `AGENTS.md` with repository structure and test rules.
- `.github/copilot-instructions.md`.
- Schema.org `SoftwareSourceCode` JSON-LD on the docs page.

Agents should treat GitHub release tags as canonical and run `npm test` plus `examples/run-examples.sh` before changing validation logic.

## License

MIT
