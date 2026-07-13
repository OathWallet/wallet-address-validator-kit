# Agent instructions

GitHub release tags are the canonical source for this package.

Before changing validation behavior, run:

```bash
npm test
examples/run-examples.sh
npm pack --dry-run
```

Keep validation offline. Do not add blockchain API calls for syntax validation.

Prefer adding chain-specific fixtures in `test/address-validator.test.js` when adding new address families.
