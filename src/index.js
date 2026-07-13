import { base58, base58check, bech32, bech32m } from "@scure/base";
import { sha256 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import cashaddr from "cashaddrjs";
import { CHAINS, getChain, listChains } from "./chains.js";

const encoder = new TextEncoder();
const base58Check = base58check(sha256);
const HEX_40 = /^(0x)?[0-9a-fA-F]{40}$/;

export { CHAINS, getChain, listChains };

function ok(input, chain, format, details = {}) {
  return {
    valid: true,
    input,
    chain: chain.id,
    chainName: chain.name,
    format,
    network: details.network ?? "mainnet",
    type: details.type,
    normalized: details.normalized ?? input,
    checksum: details.checksum,
    details
  };
}

function fail(input, reason, chain) {
  return {
    valid: false,
    input,
    chain: chain?.id,
    chainName: chain?.name,
    reason
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function equalPrefix(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  return prefix.every((byte, index) => bytes[index] === byte);
}

function decodeBase58Check(value) {
  try {
    return base58Check.decode(value);
  } catch {
    return undefined;
  }
}

function validateBase58Address(value, chain) {
  if (!chain.base58) return fail(value, "chain does not define Base58Check address prefixes", chain);
  const bytes = decodeBase58Check(value);
  if (!bytes) return fail(value, "invalid Base58Check checksum or alphabet", chain);

  for (const rule of chain.base58) {
    if (!equalPrefix(bytes, rule.prefix)) continue;
    const payloadLength = rule.payloadLength ?? 20;
    const expectedLength = rule.prefix.length + payloadLength;
    if (bytes.length !== expectedLength) {
      return fail(value, `invalid Base58Check payload length: expected ${expectedLength} bytes`, chain);
    }
    return ok(value, chain, "base58check", {
      network: rule.network,
      type: rule.type,
      prefix: `0x${bytesToHex(rule.prefix)}`,
      payloadLength,
      normalized: value,
      checksum: "base58check"
    });
  }

  return fail(value, "Base58Check prefix is not valid for this chain", chain);
}

function decodeSegwit(value) {
  try {
    const decoded = bech32.decode(value, 200);
    return { ...decoded, encoding: "bech32" };
  } catch {
    try {
      const decoded = bech32m.decode(value, 200);
      return { ...decoded, encoding: "bech32m" };
    } catch {
      return undefined;
    }
  }
}

function validateSegwitAddress(value, chain) {
  if (!chain.segwit) return fail(value, "chain does not define native SegWit HRPs", chain);
  const decoded = decodeSegwit(value);
  if (!decoded) return fail(value, "invalid Bech32 or Bech32m checksum", chain);
  const hrpRule = chain.segwit.find((rule) => rule.hrp === decoded.prefix);
  if (!hrpRule) return fail(value, "Bech32 HRP is not valid for this chain", chain);
  if (decoded.words.length < 2) return fail(value, "missing witness program", chain);

  const version = decoded.words[0];
  if (version < 0 || version > 16) return fail(value, "invalid witness version", chain);

  let program;
  try {
    program = bech32.fromWords(decoded.words.slice(1));
  } catch {
    return fail(value, "invalid witness program words", chain);
  }

  if (program.length < 2 || program.length > 40) {
    return fail(value, "witness program must be 2 to 40 bytes", chain);
  }
  if (version === 0 && ![20, 32].includes(program.length)) {
    return fail(value, "witness version 0 program must be 20 or 32 bytes", chain);
  }
  if (version === 0 && decoded.encoding !== "bech32") {
    return fail(value, "witness version 0 must use Bech32", chain);
  }
  if (version > 0 && decoded.encoding !== "bech32m") {
    return fail(value, "witness version 1+ must use Bech32m", chain);
  }

  return ok(value, chain, decoded.encoding, {
    network: hrpRule.network,
    type: version === 0 ? (program.length === 20 ? "p2wpkh" : "p2wsh") : version === 1 ? "p2tr" : `witness-v${version}`,
    hrp: decoded.prefix,
    witnessVersion: version,
    witnessProgramLength: program.length,
    normalized: value.toLowerCase(),
    checksum: decoded.encoding
  });
}

function validateCashaddr(value, chain) {
  if (!chain.cashaddr) return fail(value, "chain does not define CashAddr prefixes", chain);
  const hasPrefix = value.includes(":");
  const candidates = hasPrefix ? [value] : chain.cashaddr.map((rule) => `${rule.prefix}:${value}`);

  for (const candidate of candidates) {
    try {
      const decoded = cashaddr.decode(candidate);
      const rule = chain.cashaddr.find((item) => item.prefix === decoded.prefix);
      if (!rule) continue;
      return ok(value, chain, "cashaddr", {
        network: rule.network,
        type: decoded.type.toLowerCase(),
        prefix: decoded.prefix,
        hashLength: decoded.hash.length,
        normalized: cashaddr.encode(decoded.prefix, decoded.type, decoded.hash),
        checksum: "cashaddr"
      });
    } catch {
      // try the next prefix candidate
    }
  }

  return fail(value, "invalid CashAddr checksum, prefix, or payload", chain);
}

export function toChecksumEvmAddress(value) {
  if (!HEX_40.test(value)) throw new Error("expected a 20-byte EVM hex address");
  const lower = value.replace(/^0x/i, "").toLowerCase();
  const hash = bytesToHex(keccak_256(encoder.encode(lower)));
  let output = "0x";
  for (let index = 0; index < lower.length; index += 1) {
    const character = lower[index];
    output += Number.parseInt(hash[index], 16) >= 8 ? character.toUpperCase() : character;
  }
  return output;
}

function validateEvmAddress(value, chain, options = {}) {
  if (!chain.evm) return fail(value, "chain is not EVM-compatible", chain);
  if (!HEX_40.test(value)) return fail(value, "EVM address must be 20 bytes of hexadecimal", chain);

  const body = value.replace(/^0x/i, "");
  const checksummed = toChecksumEvmAddress(body);
  const exactChecksum = `0x${body}` === checksummed;
  const hasNoChecksum = body === body.toLowerCase() || body === body.toUpperCase();
  const checksumValid = exactChecksum || (!options.strictChecksum && hasNoChecksum);

  if (!checksumValid) return fail(value, "invalid EIP-55 checksum", chain);

  return ok(value, chain, "evm-hex", {
    network: "mainnet",
    type: "account",
    normalized: checksummed,
    checksum: exactChecksum ? "eip55" : "none"
  });
}

function validateSolanaAddress(value, chain) {
  if (!chain.solana) return fail(value, "chain is not Solana", chain);
  let bytes;
  try {
    bytes = base58.decode(value);
  } catch {
    return fail(value, "invalid Solana base58 alphabet", chain);
  }
  if (bytes.length !== 32) return fail(value, "Solana addresses must decode to exactly 32 bytes", chain);
  return ok(value, chain, "solana-base58", {
    network: "mainnet",
    type: "account-or-pda",
    normalized: value,
    payloadLength: 32,
    checksum: "none"
  });
}

function validateBech32Account(value, chain) {
  if (!chain.bech32Account) return fail(value, "chain does not define Bech32 account HRPs", chain);
  let decoded;
  try {
    decoded = bech32.decode(value, 200);
  } catch {
    return fail(value, "invalid Bech32 checksum", chain);
  }
  const rule = chain.bech32Account.find((item) => item.hrp === decoded.prefix);
  if (!rule) return fail(value, "Bech32 HRP is not valid for this chain", chain);
  const payload = bech32.fromWords(decoded.words);
  if (rule.payloadLength && payload.length !== rule.payloadLength) {
    return fail(value, `Bech32 payload must be ${rule.payloadLength} bytes`, chain);
  }
  return ok(value, chain, "bech32", {
    network: rule.network,
    type: rule.type,
    hrp: rule.hrp,
    payloadLength: payload.length,
    normalized: value.toLowerCase(),
    checksum: "bech32"
  });
}

function validateGenericBech32(value, chain) {
  if (!chain.bech32Generic) return fail(value, "chain does not define generic Bech32 HRPs", chain);
  let decoded;
  try {
    decoded = bech32.decode(value, 1000);
  } catch {
    return fail(value, "invalid Bech32 checksum", chain);
  }
  const rule = chain.bech32Generic.find((item) => item.hrp === decoded.prefix);
  if (!rule) return fail(value, "Bech32 HRP is not valid for this chain", chain);
  if (decoded.words.length === 0) return fail(value, "Bech32 payload is empty", chain);
  return ok(value, chain, "bech32", {
    network: rule.network,
    type: rule.type,
    hrp: rule.hrp,
    wordLength: decoded.words.length,
    normalized: value.toLowerCase(),
    checksum: "bech32"
  });
}

function validatorsFor(chain) {
  return [
    chain.evm && validateEvmAddress,
    chain.solana && validateSolanaAddress,
    chain.cashaddr && validateCashaddr,
    chain.segwit && validateSegwitAddress,
    chain.bech32Account && validateBech32Account,
    chain.bech32Generic && validateGenericBech32,
    chain.base58 && validateBase58Address
  ].filter(Boolean);
}

export function validateAddress(value, options = {}) {
  const input = String(value ?? "").trim();
  if (!input) return fail(input, "address is empty");

  if (options.chain) {
    const chain = getChain(options.chain);
    if (!chain) return fail(input, `unsupported chain: ${options.chain}`);
    const failures = [];
    for (const validator of validatorsFor(chain)) {
      const result = validator(input, chain, options);
      if (result.valid) return result;
      failures.push(result.reason);
    }
    return fail(input, failures.join("; ") || "no validators available for chain", chain);
  }

  const matches = [];
  for (const chain of CHAINS) {
    for (const validator of validatorsFor(chain)) {
      const result = validator(input, chain, options);
      if (result.valid) matches.push(result);
    }
  }

  if (matches.length === 0) return fail(input, "address did not match any supported chain");
  return {
    ...matches[0],
    possibleChains: matches.map((match) => ({
      chain: match.chain,
      chainName: match.chainName,
      format: match.format,
      network: match.network,
      type: match.type
    }))
  };
}

export function validateBitcoinAddress(value, options = {}) {
  return validateAddress(value, { ...options, chain: "bitcoin" });
}

export function validateEthereumAddress(value, options = {}) {
  return validateAddress(value, { ...options, chain: "ethereum" });
}

export function validateSolanaWalletAddress(value, options = {}) {
  return validateAddress(value, { ...options, chain: "solana" });
}
