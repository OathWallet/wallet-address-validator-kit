package walletaddressvalidatorkit

import (
	"crypto/sha256"
	"math/big"
	"regexp"
	"strings"
)

const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

var evmRe = regexp.MustCompile(`^(0x)?[0-9a-fA-F]{40}$`)
var evmChains = map[string]bool{"ethereum": true, "polygon": true, "bsc": true, "avalanche-c": true, "arbitrum": true, "optimism": true, "base": true}
var prefixes = map[string]map[string][]byte{
	"bitcoin":  {"p2pkh": {0x00}, "p2sh": {0x05}},
	"litecoin": {"p2pkh": {0x30}, "p2sh": {0x32}, "legacy-p2sh": {0x05}},
	"dogecoin": {"p2pkh": {0x1e}, "p2sh": {0x16}},
	"dash":     {"p2pkh": {0x4c}, "p2sh": {0x10}},
	"digibyte": {"p2pkh": {0x1e}, "p2sh": {0x3f}},
	"tron":     {"account": {0x41}},
	"zcash":    {"transparent-p2pkh": {0x1c, 0xb8}, "transparent-p2sh": {0x1c, 0xbd}},
}

type Result struct {
	Valid  bool
	Chain  string
	Format string
	Type   string
	Reason string
}

func base58Decode(value string) ([]byte, bool) {
	n := big.NewInt(0)
	radix := big.NewInt(58)
	for _, r := range value {
		i := strings.IndexRune(alphabet, r)
		if i < 0 {
			return nil, false
		}
		n.Mul(n, radix)
		n.Add(n, big.NewInt(int64(i)))
	}
	out := n.Bytes()
	zeros := 0
	for zeros < len(value) && value[zeros] == '1' {
		zeros++
	}
	return append(make([]byte, zeros), out...), true
}

func base58Check(value string) ([]byte, bool) {
	raw, ok := base58Decode(value)
	if !ok || len(raw) < 5 {
		return nil, false
	}
	payload := raw[:len(raw)-4]
	checksum := raw[len(raw)-4:]
	first := sha256.Sum256(payload)
	second := sha256.Sum256(first[:])
	for i := 0; i < 4; i++ {
		if checksum[i] != second[i] {
			return nil, false
		}
	}
	return payload, true
}

func ValidateAddress(value string, chain string) Result {
	text := strings.TrimSpace(value)
	chain = strings.ToLower(chain)
	if text == "" {
		return Result{Valid: false, Chain: chain, Reason: "address is empty"}
	}
	if evmChains[chain] {
		if evmRe.MatchString(text) {
			return Result{Valid: true, Chain: chain, Format: "evm-hex", Type: "account"}
		}
		return Result{Valid: false, Chain: chain, Reason: "invalid EVM address"}
	}
	if chain == "solana" {
		if decoded, ok := base58Decode(text); ok && len(decoded) == 32 {
			return Result{Valid: true, Chain: chain, Format: "solana-base58", Type: "account-or-pda"}
		}
		return Result{Valid: false, Chain: chain, Reason: "invalid Solana address"}
	}
	if rules, ok := prefixes[chain]; ok {
		if payload, ok := base58Check(text); ok {
			for kind, prefix := range rules {
				if len(payload) == len(prefix)+20 && strings.HasPrefix(string(payload), string(prefix)) {
					return Result{Valid: true, Chain: chain, Format: "base58check", Type: kind}
				}
			}
		}
	}
	return Result{Valid: false, Chain: chain, Reason: "address did not match supported validators"}
}
