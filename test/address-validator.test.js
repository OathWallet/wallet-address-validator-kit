import assert from "node:assert/strict";
import test from "node:test";
import { base58check, bech32, bech32m } from "@scure/base";
import { sha256 } from "@noble/hashes/sha2.js";
import {
  listChains,
  toChecksumEvmAddress,
  validateAddress,
  validateBitcoinAddress,
  validateEthereumAddress
} from "../src/index.js";

const b58check = base58check(sha256);
const sample20 = Uint8Array.from({ length: 20 }, (_, index) => index + 1);

function b58(prefix) {
  return b58check.encode(Uint8Array.from([...prefix, ...sample20]));
}

function bech32Address(hrp) {
  return bech32.encode(hrp, [0, ...bech32.toWords(sample20)]);
}

test("validates classic Bitcoin Base58Check and rejects checksum mutation", () => {
  const result = validateBitcoinAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT");
  assert.equal(result.valid, true);
  assert.equal(result.type, "p2pkh");
  assert.equal(validateBitcoinAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyU").valid, false);
});

test("validates Bitcoin SegWit v0 Bech32 and Taproot Bech32m", () => {
  assert.equal(validateAddress(bech32Address("bc"), { chain: "bitcoin" }).valid, true);
  const taprootAddress = bech32m.encode("bc", [
    1,
    ...bech32m.toWords(Uint8Array.from({ length: 32 }, (_, index) => index + 1))
  ]);
  const taproot = validateAddress(taprootAddress, { chain: "bitcoin" });
  assert.equal(taproot.valid, true);
  assert.equal(taproot.type, "p2tr");
});

test("validates EIP-55 Ethereum and EVM addresses", () => {
  const checksum = toChecksumEvmAddress("52908400098527886e0f7030069857d2e4169ee7");
  assert.equal(checksum, "0x52908400098527886E0F7030069857D2E4169EE7");
  assert.equal(validateEthereumAddress(checksum, { strictChecksum: true }).valid, true);
  assert.equal(validateEthereumAddress("0x52908400098527886E0F7030069857D2E4169Ee7", { strictChecksum: true }).valid, false);
  assert.equal(validateAddress(checksum, { chain: "polygon" }).valid, true);
});

test("validates Solana base58 32-byte addresses", () => {
  const result = validateAddress("11111111111111111111111111111111", { chain: "solana" });
  assert.equal(result.valid, true);
  assert.equal(result.format, "solana-base58");
  assert.equal(validateAddress("111111111111111111111111111111111", { chain: "solana" }).valid, false);
});

test("validates Litecoin, Dogecoin, Dash, DigiByte, TRON, and Zcash prefixes", () => {
  assert.equal(validateAddress(b58([0x30]), { chain: "litecoin" }).valid, true);
  assert.equal(validateAddress(b58([0x1e]), { chain: "dogecoin" }).valid, true);
  assert.equal(validateAddress(b58([0x4c]), { chain: "dash" }).valid, true);
  assert.equal(validateAddress(b58([0x3f]), { chain: "digibyte" }).valid, true);
  assert.equal(validateAddress(b58([0x41]), { chain: "tron" }).valid, true);
  assert.equal(validateAddress(b58([0x1c, 0xb8]), { chain: "zcash" }).valid, true);
});

test("validates Litecoin and DigiByte native SegWit HRPs", () => {
  assert.equal(validateAddress(bech32Address("ltc"), { chain: "litecoin" }).valid, true);
  assert.equal(validateAddress(bech32Address("dgb"), { chain: "digibyte" }).valid, true);
});

test("validates Bitcoin Cash CashAddr with and without prefix", () => {
  const prefixed = "bitcoincash:qqqsyqcyq5rqwzqfpg9scrgwpugpzysnzstne440kw";
  const unprefixed = "qqqsyqcyq5rqwzqfpg9scrgwpugpzysnzstne440kw";
  assert.equal(validateAddress(prefixed, { chain: "bitcoin-cash" }).valid, true);
  assert.equal(validateAddress(unprefixed, { chain: "bitcoin-cash" }).valid, true);
});

test("validates Cosmos-style Bech32 account addresses", () => {
  const cosmos = bech32.encode("cosmos", bech32.toWords(sample20));
  assert.equal(validateAddress(cosmos, { chain: "cosmos" }).valid, true);
  assert.equal(validateAddress(cosmos, { chain: "osmosis" }).valid, false);
});

test("validates Cardano Bech32 syntax and HRP", () => {
  const cardano = bech32.encode("addr", bech32.toWords(Uint8Array.from([1, ...sample20])));
  assert.equal(validateAddress(cardano, { chain: "cardano" }).valid, true);
});

test("auto-detects possible chains for ambiguous addresses", () => {
  const result = validateAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT");
  assert.equal(result.valid, true);
  assert.ok(result.possibleChains.some((match) => match.chain === "bitcoin"));
});

test("lists important supported chains", () => {
  const ids = listChains().map((chain) => chain.id);
  for (const id of ["bitcoin", "ethereum", "solana", "dogecoin", "litecoin", "bitcoin-cash", "cosmos", "cardano"]) {
    assert.ok(ids.includes(id), `${id} should be listed`);
  }
});
