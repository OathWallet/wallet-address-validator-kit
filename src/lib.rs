use sha2::{Digest, Sha256};

const ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ValidationResult {
    pub valid: bool,
    pub chain: String,
    pub format: Option<String>,
    pub kind: Option<String>,
    pub reason: Option<String>,
}

fn b58decode(value: &str) -> Option<Vec<u8>> {
    let mut out = vec![0u8];
    for byte in value.bytes() {
        let digit = ALPHABET.iter().position(|&x| x == byte)? as u32;
        let mut carry = digit;
        for item in out.iter_mut().rev() {
            let n = (*item as u32) * 58 + carry;
            *item = (n & 0xff) as u8;
            carry = n >> 8;
        }
        while carry > 0 {
            out.insert(0, (carry & 0xff) as u8);
            carry >>= 8;
        }
    }
    let zeros = value.bytes().take_while(|&b| b == b'1').count();
    let first_nonzero = out.iter().position(|&b| b != 0).unwrap_or(out.len());
    let mut result = vec![0u8; zeros];
    result.extend_from_slice(&out[first_nonzero..]);
    Some(result)
}

fn b58check(value: &str) -> Option<Vec<u8>> {
    let raw = b58decode(value)?;
    if raw.len() < 5 {
        return None;
    }
    let (payload, checksum) = raw.split_at(raw.len() - 4);
    let first = Sha256::digest(payload);
    let second = Sha256::digest(first);
    if &second[..4] == checksum {
        Some(payload.to_vec())
    } else {
        None
    }
}

fn prefixes(chain: &str) -> Option<Vec<(&'static [u8], &'static str)>> {
    match chain {
        "bitcoin" => Some(vec![(&[0x00], "p2pkh"), (&[0x05], "p2sh")]),
        "litecoin" => Some(vec![(&[0x30], "p2pkh"), (&[0x32], "p2sh"), (&[0x05], "legacy-p2sh")]),
        "dogecoin" => Some(vec![(&[0x1e], "p2pkh"), (&[0x16], "p2sh")]),
        "dash" => Some(vec![(&[0x4c], "p2pkh"), (&[0x10], "p2sh")]),
        "digibyte" => Some(vec![(&[0x1e], "p2pkh"), (&[0x3f], "p2sh")]),
        "tron" => Some(vec![(&[0x41], "account")]),
        "zcash" => Some(vec![(&[0x1c, 0xb8], "transparent-p2pkh"), (&[0x1c, 0xbd], "transparent-p2sh")]),
        _ => None,
    }
}

pub fn validate_address(value: &str, chain: &str) -> ValidationResult {
    let text = value.trim();
    let chain = chain.to_lowercase();
    let fail = |reason: &str| ValidationResult {
        valid: false,
        chain: chain.clone(),
        format: None,
        kind: None,
        reason: Some(reason.to_string()),
    };
    if text.is_empty() {
        return fail("address is empty");
    }
    if matches!(chain.as_str(), "ethereum" | "polygon" | "bsc" | "avalanche-c" | "arbitrum" | "optimism" | "base") {
        let body = text.strip_prefix("0x").or_else(|| text.strip_prefix("0X")).unwrap_or(text);
        if body.len() == 40 && body.bytes().all(|b| b.is_ascii_hexdigit()) {
            return ValidationResult { valid: true, chain, format: Some("evm-hex".into()), kind: Some("account".into()), reason: None };
        }
        return fail("invalid EVM address");
    }
    if chain == "solana" {
        if b58decode(text).map(|bytes| bytes.len() == 32).unwrap_or(false) {
            return ValidationResult { valid: true, chain, format: Some("solana-base58".into()), kind: Some("account-or-pda".into()), reason: None };
        }
        return fail("invalid Solana address");
    }
    if let Some(rules) = prefixes(&chain) {
        if let Some(payload) = b58check(text) {
            for (prefix, kind) in rules {
                if payload.starts_with(prefix) && payload.len() == prefix.len() + 20 {
                    return ValidationResult { valid: true, chain, format: Some("base58check".into()), kind: Some(kind.into()), reason: None };
                }
            }
        }
    }
    fail("address did not match supported validators")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validates_addresses() {
        assert!(validate_address("1BoatSLRHtKNngkdXEeobR76b53LETtpyT", "bitcoin").valid);
        assert!(!validate_address("1BoatSLRHtKNngkdXEeobR76b53LETtpyU", "bitcoin").valid);
        assert!(validate_address("0xde709f2102306220921060314715629080e2fb77", "ethereum").valid);
        assert!(validate_address("11111111111111111111111111111111", "solana").valid);
        assert!(validate_address("D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", "dogecoin").valid);
        assert!(validate_address("LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", "litecoin").valid);
    }
}
