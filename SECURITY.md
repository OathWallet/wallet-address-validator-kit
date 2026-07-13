# Security Policy

## Supported versions

Security fixes are made on the latest released version of `wallet-address-validator-kit`.

## Offline-only posture

This package validates wallet data locally. It must not send mnemonics, private keys, WIF strings, extended keys, or addresses to remote APIs, analytics, logs, or telemetry.

## Reporting vulnerabilities

Open a private security advisory on GitHub or email the maintainer listed in the package metadata. Do not include real wallet secrets in reports. Use public test vectors only.

## Security checks before release

- Run the language test suites.
- Run dependency audit workflows.
- Run fuzz/smoke tests for parser rejection behavior.
- Confirm examples do not contain real funds, real private keys, or production mnemonics.
