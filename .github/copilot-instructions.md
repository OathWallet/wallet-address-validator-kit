# Copilot instructions

This package validates blockchain wallet address syntax offline.

Rules:

- Keep GitHub as source of truth.
- Do not add network calls for validation.
- Do not log user-provided addresses in tests beyond public fixtures.
- Run `npm test`, `examples/run-examples.sh`, and `npm pack --dry-run` before release.
- Preserve EIP-55, BIP-173, BIP-350, Base58Check, CashAddr, and Bech32 semantics.
