# Threat model

## Assets protected

- User mnemonics, private keys, WIF strings, extended private keys, and wallet addresses.
- Developer trust in deterministic offline validation.

## In scope

- Parser correctness.
- Checksum validation.
- Rejecting malformed or ambiguous inputs.
- Preventing accidental network use.
- Keeping public examples limited to known fixtures.

## Out of scope

- Proving ownership of funds.
- Querying balances or chain activity.
- Custody, signing, or transaction broadcast.

## Main risks

1. Accepting invalid wallet material as valid.
2. Rejecting valid wallet material developers rely on.
3. Accidentally leaking secrets through logs, analytics, crash reports, or network calls.
4. Dependency compromise in package managers.

## Controls

- Offline-only implementation.
- Public test vectors in `test-vectors/public-vectors.json`.
- CI across supported languages.
- Dependency audit workflow.
- Fuzz/smoke tests for parser behavior.
