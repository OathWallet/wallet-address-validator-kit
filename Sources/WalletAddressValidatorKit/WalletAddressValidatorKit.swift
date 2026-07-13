import Foundation
import CryptoKit

public struct AddressValidationResult: Equatable {
    public let valid: Bool
    public let chain: String
    public let format: String?
    public let type: String?
    public let reason: String?
}

public enum WalletAddressValidatorKit {
    private static let alphabet = Array("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
    private static let evmChains: Set<String> = ["ethereum", "polygon", "bsc", "avalanche-c", "arbitrum", "optimism", "base"]
    private static let prefixes: [String: [([UInt8], String)]] = [
        "bitcoin": [([0x00], "p2pkh"), ([0x05], "p2sh")],
        "litecoin": [([0x30], "p2pkh"), ([0x32], "p2sh"), ([0x05], "legacy-p2sh")],
        "dogecoin": [([0x1e], "p2pkh"), ([0x16], "p2sh")],
        "dash": [([0x4c], "p2pkh"), ([0x10], "p2sh")],
        "digibyte": [([0x1e], "p2pkh"), ([0x3f], "p2sh")],
        "tron": [([0x41], "account")],
        "zcash": [([0x1c, 0xb8], "transparent-p2pkh"), ([0x1c, 0xbd], "transparent-p2sh")]
    ]

    public static func validateAddress(_ value: String, chain: String) -> AddressValidationResult {
        let text = value.trimmingCharacters(in: .whitespacesAndNewlines)
        let chainId = chain.lowercased()
        func fail(_ reason: String) -> AddressValidationResult {
            AddressValidationResult(valid: false, chain: chainId, format: nil, type: nil, reason: reason)
        }
        guard !text.isEmpty else { return fail("address is empty") }

        if evmChains.contains(chainId) {
            let body = text.hasPrefix("0x") || text.hasPrefix("0X") ? String(text.dropFirst(2)) : text
            if body.count == 40 && body.allSatisfy({ $0.isHexDigit }) {
                return AddressValidationResult(valid: true, chain: chainId, format: "evm-hex", type: "account", reason: nil)
            }
            return fail("invalid EVM address")
        }

        if chainId == "solana" {
            if let decoded = base58Decode(text), decoded.count == 32 {
                return AddressValidationResult(valid: true, chain: chainId, format: "solana-base58", type: "account-or-pda", reason: nil)
            }
            return fail("invalid Solana address")
        }

        if let rules = prefixes[chainId], let payload = base58CheckDecode(text) {
            for (prefix, type) in rules where payload.starts(with: prefix) && payload.count == prefix.count + 20 {
                return AddressValidationResult(valid: true, chain: chainId, format: "base58check", type: type, reason: nil)
            }
        }

        return fail("address did not match supported validators")
    }

    private static func base58Decode(_ value: String) -> [UInt8]? {
        var bytes: [UInt8] = [0]
        for character in value {
            guard let digit = alphabet.firstIndex(of: character) else { return nil }
            var carry = digit
            for index in stride(from: bytes.count - 1, through: 0, by: -1) {
                let n = Int(bytes[index]) * 58 + carry
                bytes[index] = UInt8(n & 0xff)
                carry = n >> 8
            }
            while carry > 0 {
                bytes.insert(UInt8(carry & 0xff), at: 0)
                carry >>= 8
            }
        }
        let zeros = value.prefix(while: { $0 == "1" }).count
        let trimmed = bytes.drop(while: { $0 == 0 })
        return Array(repeating: 0, count: zeros) + Array(trimmed)
    }

    private static func base58CheckDecode(_ value: String) -> [UInt8]? {
        guard let raw = base58Decode(value), raw.count >= 5 else { return nil }
        let payload = Array(raw.dropLast(4))
        let checksum = Array(raw.suffix(4))
        let first = SHA256.hash(data: Data(payload))
        let second = SHA256.hash(data: Data(first))
        return Array(second.prefix(4)) == checksum ? payload : nil
    }
}
