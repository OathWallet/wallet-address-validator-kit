import test from 'node:test';
import assert from 'node:assert/strict';

const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0OIl+/=';
function randomInput(i) { let out = ''; for (let j = 0; j < (i % 80) + 1; j++) out += alphabet[(i * 17 + j * 31) % alphabet.length]; return out; }

test('fuzz parser rejection smoke test', async () => {
  const mod = await import('../src/index.js');
  for (let i = 0; i < 500; i++) {
    const input = randomInput(i);
    let result;
    if (mod.validateWalletKey) result = mod.validateWalletKey(input, { chain: 'bitcoin' });
    else if (mod.validateAddress) result = mod.validateAddress(input, { chain: 'bitcoin' });
    else if (mod.validateMnemonic) result = mod.validateMnemonic(input);
    assert.equal(typeof result.valid, 'boolean');
  }
});
