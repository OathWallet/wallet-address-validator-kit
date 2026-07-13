import { validateAddress, validateEthereumAddress, validateBitcoinAddress } from "../../src/index.js";

const bitcoin = validateBitcoinAddress("1BoatSLRHtKNngkdXEeobR76b53LETtpyT");
const ethereum = validateEthereumAddress("0x52908400098527886E0F7030069857D2E4169EE7", { strictChecksum: true });
const solana = validateAddress("11111111111111111111111111111111", { chain: "solana" });
const dogecoin = validateAddress("D5ERdEN1gsouFSs7zsq7VYJxyWP6dP28H1", { chain: "dogecoin" });
const litecoin = validateAddress("LKKHMBjCU89fyFNgSRprDoD8Jb25N8uWvd", { chain: "litecoin" });

console.log("bitcoin valid:", bitcoin.valid);
console.log("ethereum valid:", ethereum.valid);
console.log("solana valid:", solana.valid);
console.log("dogecoin valid:", dogecoin.valid);
console.log("litecoin valid:", litecoin.valid);

if (![bitcoin, ethereum, solana, dogecoin, litecoin].every((result) => result.valid)) {
  process.exit(1);
}
