const STABLESWAP_ABI = [
  {
    name: "Transfer",
    inputs: [
      { type: "address", name: "sender", indexed: true },
      { type: "address", name: "receiver", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "TokenExchange",
    inputs: [
      { type: "address", name: "buyer", indexed: true },
      { type: "int128", name: "sold_id", indexed: false },
      { type: "uint256", name: "tokens_sold", indexed: false },
      { type: "int128", name: "bought_id", indexed: false },
      { type: "uint256", name: "tokens_bought", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "TokenExchangeUnderlying",
    inputs: [
      { type: "address", name: "buyer", indexed: true },
      { type: "int128", name: "sold_id", indexed: false },
      { type: "uint256", name: "tokens_sold", indexed: false },
      { type: "int128", name: "bought_id", indexed: false },
      { type: "uint256", name: "tokens_bought", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "AddLiquidity",
    inputs: [
      { type: "address", name: "provider", indexed: true },
      { type: "uint256[2]", name: "token_amounts", indexed: false },
      { type: "uint256[2]", name: "fees", indexed: false },
      { type: "uint256", name: "invariant", indexed: false },
      { type: "uint256", name: "token_supply", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RemoveLiquidity",
    inputs: [
      { type: "address", name: "provider", indexed: true },
      { type: "uint256[2]", name: "token_amounts", indexed: false },
      { type: "uint256[2]", name: "fees", indexed: false },
      { type: "uint256", name: "token_supply", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RemoveLiquidityOne",
    inputs: [
      { type: "address", name: "provider", indexed: true },
      { type: "uint256", name: "token_amount", indexed: false },
      { type: "uint256", name: "coin_amount", indexed: false },
      { type: "uint256", name: "token_supply", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RemoveLiquidityImbalance",
    inputs: [
      { type: "address", name: "provider", indexed: true },
      { type: "uint256[2]", name: "token_amounts", indexed: false },
      { type: "uint256[2]", name: "fees", indexed: false },
      { type: "uint256", name: "invariant", indexed: false },
      { type: "uint256", name: "token_supply", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "CommitNewAdmin",
    inputs: [
      { type: "uint256", name: "deadline", indexed: true },
      { type: "address", name: "admin", indexed: true },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewAdmin",
    inputs: [{ type: "address", name: "admin", indexed: true }],
    anonymous: false,
    type: "event",
  },
  {
    name: "CommitNewFee",
    inputs: [
      { type: "uint256", name: "deadline", indexed: true },
      { type: "uint256", name: "fee", indexed: false },
      { type: "uint256", name: "admin_fee", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "NewFee",
    inputs: [
      { type: "uint256", name: "fee", indexed: false },
      { type: "uint256", name: "admin_fee", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "RampA",
    inputs: [
      { type: "uint256", name: "old_A", indexed: false },
      { type: "uint256", name: "new_A", indexed: false },
      { type: "uint256", name: "initial_time", indexed: false },
      { type: "uint256", name: "future_time", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    name: "StopRampA",
    inputs: [
      { type: "uint256", name: "A", indexed: false },
      { type: "uint256", name: "t", indexed: false },
    ],
    anonymous: false,
    type: "event",
  },
  {
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    name: "initialize",
    outputs: [],
    inputs: [
      { type: "string", name: "_name" },
      { type: "string", name: "_symbol" },
      { type: "address", name: "_coin" },
      { type: "uint256", name: "_decimals" },
      { type: "uint256", name: "_A" },
      { type: "uint256", name: "_fee" },
      { type: "address", name: "_admin" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 435044,
  },
  {
    name: "decimals",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 291,
  },
  {
    name: "transfer",
    outputs: [{ type: "bool", name: "" }],
    inputs: [
      { type: "address", name: "_to" },
      { type: "uint256", name: "_value" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 74743,
  },
  {
    name: "transferFrom",
    outputs: [{ type: "bool", name: "" }],
    inputs: [
      { type: "address", name: "_from" },
      { type: "address", name: "_to" },
      { type: "uint256", name: "_value" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 111385,
  },
  {
    name: "approve",
    outputs: [{ type: "bool", name: "" }],
    inputs: [
      { type: "address", name: "_spender" },
      { type: "uint256", name: "_value" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 37824,
  },
  {
    name: "admin_fee",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 441,
  },
  {
    name: "A",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 5529,
  },
  {
    name: "A_precise",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 5491,
  },
  {
    name: "get_virtual_price",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 1016457,
  },
  {
    name: "calc_token_amount",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256[2]", name: "_amounts" },
      { type: "bool", name: "_is_deposit" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 4021232,
  },
  {
    name: "add_liquidity",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256[2]", name: "_amounts" },
      { type: "uint256", name: "_min_mint_amount" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "add_liquidity",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256[2]", name: "_amounts" },
      { type: "uint256", name: "_min_mint_amount" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "get_dy",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 2454975,
  },
  {
    name: "get_dy_underlying",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 2457373,
  },
  {
    name: "exchange",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
      { type: "uint256", name: "min_dy" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "exchange",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
      { type: "uint256", name: "min_dy" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "exchange_underlying",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
      { type: "uint256", name: "min_dy" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "exchange_underlying",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "int128", name: "i" },
      { type: "int128", name: "j" },
      { type: "uint256", name: "dx" },
      { type: "uint256", name: "min_dy" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "remove_liquidity",
    outputs: [{ type: "uint256[2]", name: "" }],
    inputs: [
      { type: "uint256", name: "_burn_amount" },
      { type: "uint256[2]", name: "_min_amounts" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "remove_liquidity",
    outputs: [{ type: "uint256[2]", name: "" }],
    inputs: [
      { type: "uint256", name: "_burn_amount" },
      { type: "uint256[2]", name: "_min_amounts" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "remove_liquidity_imbalance",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256[2]", name: "_amounts" },
      { type: "uint256", name: "_max_burn_amount" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "remove_liquidity_imbalance",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256[2]", name: "_amounts" },
      { type: "uint256", name: "_max_burn_amount" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "calc_withdraw_one_coin",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256", name: "_burn_amount" },
      { type: "int128", name: "i" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 5258,
  },
  {
    name: "remove_liquidity_one_coin",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256", name: "_burn_amount" },
      { type: "int128", name: "i" },
      { type: "uint256", name: "_min_received" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "remove_liquidity_one_coin",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "uint256", name: "_burn_amount" },
      { type: "int128", name: "i" },
      { type: "uint256", name: "_min_received" },
      { type: "address", name: "_receiver" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "ramp_A",
    outputs: [],
    inputs: [
      { type: "uint256", name: "_future_A" },
      { type: "uint256", name: "_future_time" },
    ],
    stateMutability: "nonpayable",
    type: "function",
    gas: 152224,
  },
  {
    name: "stop_ramp_A",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 148985,
  },
  {
    name: "admin_balances",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "uint256", name: "i" }],
    stateMutability: "view",
    type: "function",
    gas: 3511,
  },
  {
    name: "withdraw_admin_fees",
    outputs: [],
    inputs: [],
    stateMutability: "nonpayable",
    type: "function",
    gas: 2597385,
  },
  {
    name: "admin",
    outputs: [{ type: "address", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2051,
  },
  {
    name: "coins",
    outputs: [{ type: "address", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2190,
  },
  {
    name: "balances",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "uint256", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2220,
  },
  {
    name: "fee",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2141,
  },
  {
    name: "base_virtual_price",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2171,
  },
  {
    name: "base_cache_updated",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2201,
  },
  {
    name: "initial_A",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2231,
  },
  {
    name: "future_A",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2261,
  },
  {
    name: "initial_A_time",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2291,
  },
  {
    name: "future_A_time",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2321,
  },
  {
    name: "name",
    outputs: [{ type: "string", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 8753,
  },
  {
    name: "symbol",
    outputs: [{ type: "string", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 7806,
  },
  {
    name: "balanceOf",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [{ type: "address", name: "arg0" }],
    stateMutability: "view",
    type: "function",
    gas: 2626,
  },
  {
    name: "allowance",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [
      { type: "address", name: "arg0" },
      { type: "address", name: "arg1" },
    ],
    stateMutability: "view",
    type: "function",
    gas: 2871,
  },
  {
    name: "totalSupply",
    outputs: [{ type: "uint256", name: "" }],
    inputs: [],
    stateMutability: "view",
    type: "function",
    gas: 2471,
  },
];
export default STABLESWAP_ABI;
