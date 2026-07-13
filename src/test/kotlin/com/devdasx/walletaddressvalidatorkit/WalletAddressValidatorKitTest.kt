package com.devdasx.walletaddressvalidatorkit

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class WalletAddressValidatorKitTest {
    @Test
    fun validatesAddresses() {
        assertTrue(WalletAddressValidatorKit.validateAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT", "bitcoin").valid)
        assertFalse(WalletAddressValidatorKit.validateAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyU", "bitcoin").valid)
        assertTrue(WalletAddressValidatorKit.validateAddress("0xde709f2102306220921060314715629080e2fb77", "ethereum").valid)
        assertTrue(WalletAddressValidatorKit.validateAddress("11111111111111111111111111111111", "solana").valid)
        assertTrue(WalletAddressValidatorKit.validateAddress("D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", "dogecoin").valid)
        assertTrue(WalletAddressValidatorKit.validateAddress("LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", "litecoin").valid)
    }
}
