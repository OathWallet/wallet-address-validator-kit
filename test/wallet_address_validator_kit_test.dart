import 'package:test/test.dart';
import 'package:wallet_address_validator_kit/wallet_address_validator_kit.dart';

void main() {
  test('validates addresses', () {
    expect(validateAddress('1BoatSLRHtKNngkdXEeobR76b53LETtpyT', chain: 'bitcoin')['valid'], true);
    expect(validateAddress('1BoatSLRHtKNngkdXEeobR76b53LETtpyU', chain: 'bitcoin')['valid'], false);
    expect(validateAddress('0xde709f2102306220921060314715629080e2fb77', chain: 'ethereum')['valid'], true);
    expect(validateAddress('11111111111111111111111111111111', chain: 'solana')['valid'], true);
    expect(validateAddress('D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1', chain: 'dogecoin')['valid'], true);
    expect(validateAddress('LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd', chain: 'litecoin')['valid'], true);
  });
}
