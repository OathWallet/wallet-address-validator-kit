import XCTest
@testable import WalletAddressValidatorKit

final class WalletAddressValidatorKitTests: XCTestCase {
    func testValidatesAddresses() {
        XCTAssertTrue(WalletAddressValidatorKit.validateAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT", chain: "bitcoin").valid)
        XCTAssertFalse(WalletAddressValidatorKit.validateAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyU", chain: "bitcoin").valid)
        XCTAssertTrue(WalletAddressValidatorKit.validateAddress("0xde709f2102306220921060314715629080e2fb77", chain: "ethereum").valid)
        XCTAssertTrue(WalletAddressValidatorKit.validateAddress("11111111111111111111111111111111", chain: "solana").valid)
        XCTAssertTrue(WalletAddressValidatorKit.validateAddress("D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", chain: "dogecoin").valid)
        XCTAssertTrue(WalletAddressValidatorKit.validateAddress("LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", chain: "litecoin").valid)
    }
}
