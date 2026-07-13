import 'package:crypto/crypto.dart';

const _alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const _evmChains = {'ethereum', 'polygon', 'bsc', 'avalanche-c', 'arbitrum', 'optimism', 'base'};
const _prefixes = <String, Map<String, List<int>>>{
  'bitcoin': {'p2pkh': [0x00], 'p2sh': [0x05]},
  'litecoin': {'p2pkh': [0x30], 'p2sh': [0x32], 'legacy-p2sh': [0x05]},
  'dogecoin': {'p2pkh': [0x1e], 'p2sh': [0x16]},
  'dash': {'p2pkh': [0x4c], 'p2sh': [0x10]},
  'digibyte': {'p2pkh': [0x1e], 'p2sh': [0x3f]},
  'tron': {'account': [0x41]},
  'zcash': {'transparent-p2pkh': [0x1c, 0xb8], 'transparent-p2sh': [0x1c, 0xbd]},
};

Map<String, Object?> validateAddress(String value, {required String chain}) {
  final text = value.trim();
  final chainId = chain.toLowerCase();
  Map<String, Object?> fail(String reason) => {'valid': false, 'chain': chainId, 'reason': reason};
  if (text.isEmpty) return fail('address is empty');

  if (_evmChains.contains(chainId)) {
    final body = text.startsWith('0x') || text.startsWith('0X') ? text.substring(2) : text;
    if (RegExp(r'^[0-9a-fA-F]{40}$').hasMatch(body)) {
      return {'valid': true, 'chain': chainId, 'format': 'evm-hex', 'type': 'account'};
    }
    return fail('invalid EVM address');
  }

  if (chainId == 'solana') {
    final decoded = _base58Decode(text);
    if (decoded != null && decoded.length == 32) {
      return {'valid': true, 'chain': chainId, 'format': 'solana-base58', 'type': 'account-or-pda'};
    }
    return fail('invalid Solana address');
  }

  final rules = _prefixes[chainId];
  final payload = _base58Check(text);
  if (rules != null && payload != null) {
    for (final entry in rules.entries) {
      final prefix = entry.value;
      if (_startsWith(payload, prefix) && payload.length == prefix.length + 20) {
        return {'valid': true, 'chain': chainId, 'format': 'base58check', 'type': entry.key};
      }
    }
  }

  return fail('address did not match supported validators');
}

List<int>? _base58Decode(String value) {
  var bytes = <int>[0];
  for (final unit in value.runes) {
    final digit = _alphabet.indexOf(String.fromCharCode(unit));
    if (digit < 0) return null;
    var carry = digit;
    for (var i = bytes.length - 1; i >= 0; i--) {
      final n = bytes[i] * 58 + carry;
      bytes[i] = n & 0xff;
      carry = n >> 8;
    }
    while (carry > 0) {
      bytes.insert(0, carry & 0xff);
      carry >>= 8;
    }
  }
  final zeros = value.runes.takeWhile((r) => r == '1'.codeUnitAt(0)).length;
  bytes = bytes.skipWhile((b) => b == 0).toList();
  return [...List<int>.filled(zeros, 0), ...bytes];
}

List<int>? _base58Check(String value) {
  final raw = _base58Decode(value);
  if (raw == null || raw.length < 5) return null;
  final payload = raw.sublist(0, raw.length - 4);
  final checksum = raw.sublist(raw.length - 4);
  final first = sha256.convert(payload).bytes;
  final second = sha256.convert(first).bytes;
  if (_equals(second.sublist(0, 4), checksum)) return payload;
  return null;
}

bool _startsWith(List<int> value, List<int> prefix) {
  if (value.length < prefix.length) return false;
  for (var i = 0; i < prefix.length; i++) {
    if (value[i] != prefix[i]) return false;
  }
  return true;
}

bool _equals(List<int> a, List<int> b) {
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}
