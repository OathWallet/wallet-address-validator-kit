package walletaddressvalidatorkit

import "testing"

func TestValidateAddress(t *testing.T) {
	cases := []struct {
		address string
		chain   string
		valid   bool
	}{
		{"1BoatSLRHtKNngkdXEeobR76b53LETtpyT", "bitcoin", true},
		{"1BoatSLRHtKNngkdXEeobR76b53LETtpyU", "bitcoin", false},
		{"0xde709f2102306220921060314715629080e2fb77", "ethereum", true},
		{"11111111111111111111111111111111", "solana", true},
		{"D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", "dogecoin", true},
		{"LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", "litecoin", true},
	}
	for _, tc := range cases {
		if got := ValidateAddress(tc.address, tc.chain); got.Valid != tc.valid {
			t.Fatalf("%s/%s valid=%v reason=%s", tc.chain, tc.address, got.Valid, got.Reason)
		}
	}
}
