const CELO_SUSHISWAP_ABI = [
  {
    inputs: [
      {
        internalType: "contract IERC20",
        name: "_sushi",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    name: "Deposit",
    inputs: [
      {
        type: "address",
        name: "user",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        indexed: true,
        name: "pid",
        internalType: "uint256",
      },
      {
        internalType: "uint256",
        indexed: false,
        type: "uint256",
        name: "amount",
      },
      {
        internalType: "address",
        indexed: true,
        name: "to",
        type: "address",
      },
    ],
    type: "event",
  },
  {
    name: "EmergencyWithdraw",
    anonymous: false,
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
        indexed: true,
      },
      {
        internalType: "uint256",
        indexed: true,
        name: "pid",
        type: "uint256",
      },
      {
        type: "uint256",
        name: "amount",
        internalType: "uint256",
        indexed: false,
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
        indexed: true,
      },
    ],
    type: "event",
  },
  {
    type: "event",
    inputs: [
      {
        type: "address",
        name: "user",
        internalType: "address",
        indexed: true,
      },
      {
        indexed: true,
        type: "uint256",
        internalType: "uint256",
        name: "pid",
      },
      {
        name: "amount",
        indexed: false,
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "Harvest",
    anonymous: false,
  },
  {
    anonymous: false,
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        indexed: true,
        name: "pid",
      },
      {
        type: "uint256",
        indexed: false,
        name: "allocPoint",
        internalType: "uint256",
      },
      {
        name: "lpToken",
        internalType: "contract IERC20",
        indexed: true,
        type: "address",
      },
      {
        name: "rewarder",
        indexed: true,
        type: "address",
        internalType: "contract IRewarder",
      },
    ],
    type: "event",
    name: "LogPoolAddition",
  },
  {
    type: "event",
    inputs: [
      {
        type: "uint256",
        indexed: true,
        name: "pid",
        internalType: "uint256",
      },
      {
        name: "allocPoint",
        indexed: false,
        type: "uint256",
        internalType: "uint256",
      },
      {
        internalType: "contract IRewarder",
        indexed: true,
        type: "address",
        name: "rewarder",
      },
      {
        type: "bool",
        indexed: false,
        name: "overwrite",
        internalType: "bool",
      },
    ],
    name: "LogSetPool",
    anonymous: false,
  },
  {
    name: "LogSushiPerSecond",
    inputs: [
      {
        name: "sushiPerSecond",
        type: "uint256",
        internalType: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
    type: "event",
  },
  {
    anonymous: false,
    type: "event",
    name: "LogUpdatePool",
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "pid",
        indexed: true,
      },
      {
        type: "uint64",
        internalType: "uint64",
        name: "lastRewardTime",
        indexed: false,
      },
      {
        type: "uint256",
        indexed: false,
        name: "lpSupply",
        internalType: "uint256",
      },
      {
        name: "accSushiPerShare",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
  },
  {
    name: "OwnershipTransferred",
    anonymous: false,
    inputs: [
      {
        internalType: "address",
        name: "previousOwner",
        type: "address",
        indexed: true,
      },
      {
        internalType: "address",
        type: "address",
        indexed: true,
        name: "newOwner",
      },
    ],
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        type: "address",
        internalType: "address",
        name: "user",
        indexed: true,
      },
      {
        type: "uint256",
        name: "pid",
        indexed: true,
        internalType: "uint256",
      },
      {
        type: "uint256",
        name: "amount",
        indexed: false,
        internalType: "uint256",
      },
      {
        internalType: "address",
        indexed: true,
        name: "to",
        type: "address",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    stateMutability: "view",
    type: "function",
    name: "SUSHI",
    inputs: [],
    outputs: [
      {
        type: "address",
        internalType: "contract IERC20",
        name: "",
      },
    ],
    constant: true,
    signature: "0xab560e10",
  },
  {
    type: "function",
    outputs: [
      {
        type: "bool[]",
        name: "successes",
        internalType: "bool[]",
      },
      {
        type: "bytes[]",
        name: "results",
        internalType: "bytes[]",
      },
    ],
    name: "batch",
    stateMutability: "payable",
    inputs: [
      {
        type: "bytes[]",
        name: "calls",
        internalType: "bytes[]",
      },
      {
        internalType: "bool",
        name: "revertOnFail",
        type: "bool",
      },
    ],
  },
  {
    inputs: [],
    type: "function",
    stateMutability: "nonpayable",
    name: "claimOwnership",
    outputs: [],
  },
  {
    outputs: [
      {
        internalType: "contract IERC20",
        type: "address",
        name: "",
      },
    ],
    name: "lpToken",
    stateMutability: "view",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    type: "function",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "migrator",
    outputs: [
      {
        type: "address",
        internalType: "contract IMigratorChef",
        name: "",
      },
    ],
    constant: true,
    signature: "0x7cd07e47",
  },
  {
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "owner",
    inputs: [],
    type: "function",
    stateMutability: "view",
    constant: true,
    signature: "0x8da5cb5b",
  },
  {
    outputs: [
      {
        internalType: "address",
        type: "address",
        name: "",
      },
    ],
    name: "pendingOwner",
    stateMutability: "view",
    inputs: [],
    type: "function",
    constant: true,
    signature: "0xe30c3978",
  },
  {
    name: "permitToken",
    stateMutability: "nonpayable",
    outputs: [],
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "contract IERC20",
      },
      {
        name: "from",
        type: "address",
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        type: "uint256",
        internalType: "uint256",
        name: "deadline",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        type: "bytes32",
        name: "r",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    type: "function",
  },
  {
    stateMutability: "view",
    type: "function",
    name: "poolInfo",
    outputs: [
      {
        type: "uint128",
        name: "accSushiPerShare",
        internalType: "uint128",
      },
      {
        type: "uint64",
        internalType: "uint64",
        name: "lastRewardTime",
      },
      {
        type: "uint64",
        name: "allocPoint",
        internalType: "uint64",
      },
    ],
    inputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
  },
  {
    name: "rewarder",
    stateMutability: "view",
    inputs: [
      {
        name: "",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "contract IRewarder",
        name: "",
        type: "address",
      },
    ],
    type: "function",
  },
  {
    type: "function",
    inputs: [],
    stateMutability: "view",
    outputs: [
      {
        internalType: "uint256",
        type: "uint256",
        name: "",
      },
    ],
    name: "sushiPerSecond",
    constant: true,
    signature: "0xa06e408b",
  },
  {
    name: "totalAllocPoint",
    type: "function",
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    inputs: [],
    constant: true,
    signature: "0x17caf6f1",
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        name: "direct",
        internalType: "bool",
        type: "bool",
      },
      {
        type: "bool",
        internalType: "bool",
        name: "renounce",
      },
    ],
    name: "transferOwnership",
    outputs: [],
  },
  {
    stateMutability: "view",
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "",
      },
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    outputs: [
      {
        type: "uint256",
        name: "amount",
        internalType: "uint256",
      },
      {
        name: "rewardDebt",
        internalType: "int256",
        type: "int256",
      },
    ],
    name: "userInfo",
    type: "function",
  },
  {
    name: "poolLength",
    outputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "pools",
      },
    ],
    type: "function",
    stateMutability: "view",
    inputs: [],
    constant: true,
    signature: "0x081e3eda",
  },
  {
    outputs: [],
    stateMutability: "nonpayable",
    name: "add",
    inputs: [
      {
        name: "allocPoint",
        type: "uint256",
        internalType: "uint256",
      },
      {
        type: "address",
        internalType: "contract IERC20",
        name: "_lpToken",
      },
      {
        internalType: "contract IRewarder",
        name: "_rewarder",
        type: "address",
      },
    ],
    type: "function",
  },
  {
    outputs: [],
    name: "set",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
      {
        name: "_allocPoint",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_rewarder",
        internalType: "contract IRewarder",
        type: "address",
      },
      {
        type: "bool",
        internalType: "bool",
        name: "overwrite",
      },
    ],
  },
  {
    name: "setSushiPerSecond",
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        internalType: "uint256",
        type: "uint256",
        name: "_sushiPerSecond",
      },
    ],
    outputs: [],
  },
  {
    inputs: [
      {
        name: "_migrator",
        internalType: "contract IMigratorChef",
        type: "address",
      },
    ],
    name: "setMigrator",
    stateMutability: "nonpayable",
    type: "function",
    outputs: [],
  },
  {
    outputs: [],
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "_pid",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "migrate",
  },
  {
    inputs: [
      {
        name: "_pid",
        type: "uint256",
        internalType: "uint256",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    type: "function",
    stateMutability: "view",
    name: "pendingSushi",
    outputs: [
      {
        internalType: "uint256",
        name: "pending",
        type: "uint256",
      },
    ],
  },
  {
    name: "massUpdatePools",
    outputs: [],
    type: "function",
    inputs: [
      {
        name: "pids",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    outputs: [
      {
        internalType: "struct MiniChefV2.PoolInfo",
        components: [
          {
            name: "accSushiPerShare",
            internalType: "uint128",
            type: "uint128",
          },
          {
            name: "lastRewardTime",
            type: "uint64",
            internalType: "uint64",
          },
          {
            type: "uint64",
            internalType: "uint64",
            name: "allocPoint",
          },
        ],
        name: "pool",
        type: "tuple",
      },
    ],
    inputs: [
      {
        name: "pid",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    name: "updatePool",
    type: "function",
  },
  {
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "pid",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        type: "address",
        name: "to",
      },
    ],
    outputs: [],
    name: "deposit",
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "withdraw",
    inputs: [
      {
        name: "pid",
        internalType: "uint256",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
  },
  {
    name: "harvest",
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        internalType: "uint256",
        type: "uint256",
        name: "pid",
      },
      {
        name: "to",
        internalType: "address",
        type: "address",
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawAndHarvest",
    outputs: [],
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "pid",
      },
      {
        type: "uint256",
        internalType: "uint256",
        name: "amount",
      },
      {
        name: "to",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    name: "emergencyWithdraw",
    inputs: [
      {
        type: "uint256",
        internalType: "uint256",
        name: "pid",
      },
      {
        type: "address",
        internalType: "address",
        name: "to",
      },
    ],
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
  },
];
export default CELO_SUSHISWAP_ABI;
