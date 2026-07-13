import unittest

from wallet_address_validator_kit import validate_address, list_chains


class ValidatorTests(unittest.TestCase):
    def test_bitcoin_base58check(self):
        self.assertTrue(validate_address("1BoatSLRHtKNngkdXEeobR76b53LETtpyT", "bitcoin")["valid"])
        self.assertFalse(validate_address("1BoatSLRHtKNngkdXEeobR76b53LETtpyU", "bitcoin")["valid"])

    def test_evm_and_solana_and_prefix_chains(self):
        self.assertTrue(validate_address("0xde709f2102306220921060314715629080e2fb77", "ethereum")["valid"])
        self.assertTrue(validate_address("11111111111111111111111111111111", "solana")["valid"])
        self.assertTrue(validate_address("D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", "dogecoin")["valid"])
        self.assertTrue(validate_address("LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", "litecoin")["valid"])
        self.assertIn("bitcoin", list_chains())


if __name__ == "__main__":
    unittest.main()
