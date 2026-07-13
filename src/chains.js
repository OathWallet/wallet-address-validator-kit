export const CHAINS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    aliases: ["btc"],
    base58: [
      { prefix: [0x00], type: "p2pkh", network: "mainnet" },
      { prefix: [0x05], type: "p2sh", network: "mainnet" }
    ],
    segwit: [
      { hrp: "bc", network: "mainnet" },
      { hrp: "tb", network: "testnet" },
      { hrp: "bcrt", network: "regtest" }
    ]
  },
  {
    id: "litecoin",
    name: "Litecoin",
    aliases: ["ltc"],
    base58: [
      { prefix: [0x30], type: "p2pkh", network: "mainnet" },
      { prefix: [0x32], type: "p2sh", network: "mainnet" },
      { prefix: [0x05], type: "legacy-p2sh", network: "mainnet" },
      { prefix: [0x6f], type: "testnet-p2pkh", network: "testnet" },
      { prefix: [0x3a], type: "testnet-p2sh", network: "testnet" }
    ],
    segwit: [
      { hrp: "ltc", network: "mainnet" },
      { hrp: "tltc", network: "testnet" }
    ]
  },
  {
    id: "dogecoin",
    name: "Dogecoin",
    aliases: ["doge"],
    base58: [
      { prefix: [0x1e], type: "p2pkh", network: "mainnet" },
      { prefix: [0x16], type: "p2sh", network: "mainnet" },
      { prefix: [0x71], type: "testnet-p2pkh", network: "testnet" },
      { prefix: [0xc4], type: "testnet-p2sh", network: "testnet" }
    ]
  },
  {
    id: "dash",
    name: "Dash",
    aliases: [],
    base58: [
      { prefix: [0x4c], type: "p2pkh", network: "mainnet" },
      { prefix: [0x10], type: "p2sh", network: "mainnet" }
    ]
  },
  {
    id: "digibyte",
    name: "DigiByte",
    aliases: ["dgb"],
    base58: [
      { prefix: [0x1e], type: "p2pkh", network: "mainnet" },
      { prefix: [0x3f], type: "p2sh", network: "mainnet" }
    ],
    segwit: [
      { hrp: "dgb", network: "mainnet" }
    ]
  },
  {
    id: "bitcoin-cash",
    name: "Bitcoin Cash",
    aliases: ["bch", "bitcoincash"],
    base58: [
      { prefix: [0x00], type: "legacy-p2pkh", network: "mainnet" },
      { prefix: [0x05], type: "legacy-p2sh", network: "mainnet" }
    ],
    cashaddr: [
      { prefix: "bitcoincash", network: "mainnet" },
      { prefix: "bchtest", network: "testnet" },
      { prefix: "bchreg", network: "regtest" }
    ]
  },
  {
    id: "zcash",
    name: "Zcash transparent",
    aliases: ["zec"],
    base58: [
      { prefix: [0x1c, 0xb8], type: "transparent-p2pkh", network: "mainnet" },
      { prefix: [0x1c, 0xbd], type: "transparent-p2sh", network: "mainnet" },
      { prefix: [0x1d, 0x25], type: "testnet-transparent-p2pkh", network: "testnet" },
      { prefix: [0x1c, 0xba], type: "testnet-transparent-p2sh", network: "testnet" }
    ]
  },
  {
    id: "ethereum",
    name: "Ethereum",
    aliases: ["eth"],
    evm: true
  },
  {
    id: "polygon",
    name: "Polygon",
    aliases: ["matic"],
    evm: true
  },
  {
    id: "bsc",
    name: "BNB Smart Chain",
    aliases: ["bnb", "binance-smart-chain"],
    evm: true
  },
  {
    id: "avalanche-c",
    name: "Avalanche C-Chain",
    aliases: ["avax", "avalanche"],
    evm: true
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    aliases: ["arb"],
    evm: true
  },
  {
    id: "optimism",
    name: "Optimism",
    aliases: ["op"],
    evm: true
  },
  {
    id: "base",
    name: "Base",
    aliases: [],
    evm: true
  },
  {
    id: "tron",
    name: "TRON",
    aliases: ["trx"],
    base58: [
      { prefix: [0x41], type: "account", network: "mainnet", payloadLength: 20 }
    ]
  },
  {
    id: "solana",
    name: "Solana",
    aliases: ["sol"],
    solana: true
  },
  {
    id: "cosmos",
    name: "Cosmos Hub",
    aliases: ["atom"],
    bech32Account: [{ hrp: "cosmos", type: "account", network: "mainnet", payloadLength: 20 }]
  },
  {
    id: "osmosis",
    name: "Osmosis",
    aliases: ["osmo"],
    bech32Account: [{ hrp: "osmo", type: "account", network: "mainnet", payloadLength: 20 }]
  },
  {
    id: "juno",
    name: "Juno",
    aliases: [],
    bech32Account: [{ hrp: "juno", type: "account", network: "mainnet", payloadLength: 20 }]
  },
  {
    id: "terra",
    name: "Terra",
    aliases: ["luna"],
    bech32Account: [{ hrp: "terra", type: "account", network: "mainnet", payloadLength: 20 }]
  },
  {
    id: "cardano",
    name: "Cardano",
    aliases: ["ada"],
    bech32Generic: [
      { hrp: "addr", type: "payment", network: "mainnet" },
      { hrp: "stake", type: "stake", network: "mainnet" },
      { hrp: "addr_test", type: "payment", network: "testnet" },
      { hrp: "stake_test", type: "stake", network: "testnet" }
    ]
  }
];

const BY_ID_OR_ALIAS = new Map();
for (const chain of CHAINS) {
  BY_ID_OR_ALIAS.set(chain.id, chain);
  for (const alias of chain.aliases ?? []) BY_ID_OR_ALIAS.set(alias, chain);
}

export function getChain(chainId) {
  if (!chainId) return undefined;
  return BY_ID_OR_ALIAS.get(String(chainId).toLowerCase());
}

export function listChains() {
  return CHAINS.map((chain) => ({
    id: chain.id,
    name: chain.name,
    aliases: chain.aliases ?? [],
    supports: {
      base58: Boolean(chain.base58),
      segwit: Boolean(chain.segwit),
      cashaddr: Boolean(chain.cashaddr),
      evm: Boolean(chain.evm),
      solana: Boolean(chain.solana),
      bech32Account: Boolean(chain.bech32Account),
      bech32Generic: Boolean(chain.bech32Generic)
    }
  }));
}
