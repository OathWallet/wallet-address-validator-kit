#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Node API example"
node examples/node/example.mjs

echo "==> CLI example"
(cd examples/cli && ./run.sh)

echo "All examples passed"
