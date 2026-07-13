import hashlib
import re

ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
PREFIXES = {
    "bitcoin": [(b"\x00", "p2pkh"), (b"\x05", "p2sh")],
    "litecoin": [(b"\x30", "p2pkh"), (b"\x32", "p2sh"), (b"\x05", "legacy-p2sh")],
    "dogecoin": [(b"\x1e", "p2pkh"), (b"\x16", "p2sh")],
    "dash": [(b"\x4c", "p2pkh"), (b"\x10", "p2sh")],
    "digibyte": [(b"\x1e", "p2pkh"), (b"\x3f", "p2sh")],
    "tron": [(b"\x41", "account")],
    "zcash": [(b"\x1c\xb8", "transparent-p2pkh"), (b"\x1c\xbd", "transparent-p2sh")],
}
EVM_CHAINS = {"ethereum", "polygon", "bsc", "avalanche-c", "arbitrum", "optimism", "base"}


def _b58decode(value: str) -> bytes:
    number = 0
    for char in value:
        if char not in ALPHABET:
            raise ValueError("invalid base58 character")
        number = number * 58 + ALPHABET.index(char)
    raw = number.to_bytes((number.bit_length() + 7) // 8, "big") if number else b""
    zeros = len(value) - len(value.lstrip("1"))
    return b"\x00" * zeros + raw


def _b58check(value: str):
    raw = _b58decode(value)
    if len(raw) < 5:
        raise ValueError("too short")
    payload, checksum = raw[:-4], raw[-4:]
    expected = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    if checksum != expected:
        raise ValueError("bad checksum")
    return payload


def list_chains():
    return sorted(set(PREFIXES) | EVM_CHAINS | {"solana"})


def validate_address(value: str, chain: str | None = None):
    text = (value or "").strip()
    chain_id = chain.lower() if chain else None
    if not text:
        return {"valid": False, "reason": "address is empty"}

    candidates = [chain_id] if chain_id else list_chains()
    for candidate in candidates:
        if candidate in EVM_CHAINS:
            if re.fullmatch(r"0x?[0-9a-fA-F]{40}", text):
                return {"valid": True, "chain": candidate, "format": "evm-hex", "type": "account"}
        elif candidate == "solana":
            try:
                if len(_b58decode(text)) == 32:
                    return {"valid": True, "chain": "solana", "format": "solana-base58", "type": "account-or-pda"}
            except ValueError:
                pass
        elif candidate in PREFIXES:
            try:
                payload = _b58check(text)
                for prefix, kind in PREFIXES[candidate]:
                    if payload.startswith(prefix) and len(payload) == len(prefix) + 20:
                        return {"valid": True, "chain": candidate, "format": "base58check", "type": kind}
            except ValueError:
                pass

    return {"valid": False, "chain": chain_id, "reason": "address did not match supported validators"}
