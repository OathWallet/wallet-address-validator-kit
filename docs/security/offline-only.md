# Offline-only guarantee

`wallet-address-validator-kit` is designed for local validation only.

The package must not call blockchain RPC providers, analytics endpoints, telemetry endpoints, or any API that uploads wallet material. Runtime validation must work without network access.
