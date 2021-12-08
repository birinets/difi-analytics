import { ethers } from "ethers";
import {
  lookUpPrices,
  getPoolPrices,
  printChefPool,
  formatMoney,
} from "./ethers_helper";
import { _print } from '../utils/output';

import MOVR_VAULT_TOKEN_ABI from "../abis/movr_vault_token_abi";
import MOVR_VAULT_WANT_ABI from "../abis/movr_vault_want_abi";
import MOVR_DLP_ABI from "../abis/movr_dlp_token_abi";
import UNI_ABI from "../abis/uni_abi";
import ERC20_ABI from "../abis/erc20_abi";

const MoonriverTokens = [
  {
    id: "moonriver",
    symbol: "MOVR",
    contract: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
  },
  {
    id: "weth",
    symbol: "WETH",
    contract: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    contract: "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D",
  },
  {
    id: "tether",
    symbol: "USDT",
    contract: "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
  },
  {
    id: "dai",
    symbol: "DAI",
    contract: "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844",
  },
  {
    id: "wrapped-bitcoin",
    symbol: "WBTC",
    contract: "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    contract: "0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c",
  },
  {
    id: "binance-usd",
    symbol: "BUSD",
    contract: "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818",
  },
  {
    id: "elk-finance",
    symbol: "ELK",
    contract: "0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C",
  },
  {
    id: "sushi",
    symbol: "SUSHI",
    contract: "0xf390830DF829cf22c53c8840554B98eafC5dCBc2",
  },
];

async function getMoonriverPrices() {
  const idPrices = await lookUpPrices(MoonriverTokens.map((x) => x.id));
  const prices = {};
  for (const bt of MoonriverTokens)
    if (idPrices[bt.id]) prices[bt.contract] = idPrices[bt.id];
  return prices;
}

async function getMoonriverUniPool(App, pool, poolAddress, stakingAddress) {
  let q0, q1;
  const reserves = await pool.getReserves();
  q0 = reserves._reserve0;
  q1 = reserves._reserve1;
  const decimals = await pool.decimals();
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  return {
    symbol: await pool.symbol(),
    name: await pool.name(),
    address: poolAddress,
    token0,
    q0,
    token1,
    q1,
    totalSupply: (await pool.totalSupply()) / 10 ** decimals,
    stakingAddress: stakingAddress,
    staked: (await pool.balanceOf(stakingAddress)) / 10 ** decimals,
    decimals: decimals,
    unstaked: (await pool.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    contract: pool,
    tokens: [token0, token1],
    is1inch: false,
  };
}

async function getercMoonriver20(App, token, address, stakingAddress) {
  if (address === "0x0000000000000000000000000000000000000000") {
    return {
      address,
      name: "moonriver",
      symbol: "moonriver",
      totalSupply: 1e8,
      decimals: 18,
      staked: 0,
      unstaked: 0,
      contract: null,
      tokens: [address],
    };
  }
  const decimals = await token.decimals();
  return {
    address,
    name: await token.name(),
    symbol: await token.symbol(),
    totalSupply: await token.totalSupply(),
    decimals: decimals,
    staked: (await token.balanceOf(stakingAddress)) / 10 ** decimals,
    unstaked: (await token.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    contract: token,
    tokens: [address],
  };
}

async function getMoonriverVault(App, vault, address, stakingAddress) {
  const decimals = await vault.decimals();
  const token_ = await vault.token();
  const token = await getMoonriverToken(App, token_, address);
  return {
    address,
    name: await vault.name(),
    symbol: await vault.symbol(),
    totalSupply: await vault.totalSupply(),
    decimals: decimals,
    staked: (await vault.balanceOf(stakingAddress)) / 10 ** decimals,
    unstaked: (await vault.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    token: token,
    balance: await vault.balance(),
    contract: vault,
    tokens: [address].concat(token.tokens),
  };
}

async function getMoonriverWantVault(App, vault, address, stakingAddress) {
  const decimals = await vault.decimals();
  const token_ = await vault.want();
  const token = await getMoonriverToken(App, token_, address);
  return {
    address,
    name: await vault.name(),
    symbol: await vault.symbol(),
    totalSupply: await vault.totalSupply(),
    decimals: decimals,
    staked: (await vault.balanceOf(stakingAddress)) / 10 ** decimals,
    unstaked: (await vault.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    token: token,
    balance: await vault.balance(),
    contract: vault,
    tokens: [address].concat(token.tokens),
  };
}

async function getMoonriverSpoonVault(
  App,
  spoonVault,
  address,
  stakingAddress
) {
  const decimals = await spoonVault.decimals();
  const token_ = await spoonVault.wantToken();
  const token = await getMoonriverToken(App, token_, address);
  return {
    address,
    name: await spoonVault.name(),
    symbol: await spoonVault.symbol(),
    totalSupply: await spoonVault.totalSupply(),
    decimals: decimals,
    staked: (await spoonVault.balanceOf(stakingAddress)) / 10 ** decimals,
    unstaked: (await spoonVault.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    token: token,
    balance: await spoonVault.totalTokenBalance(),
    contract: spoonVault,
    tokens: [address].concat(token.tokens),
  };
}

async function getMoonriverDlpPool(
  App,
  dlpPool,
  tokenAddress,
  originTokenAddress,
  stakingAddress
) {
  const ownerAddress = await dlpPool._OWNER_();
  const originToken = await getMoonriverToken(
    App,
    originTokenAddress,
    ownerAddress
  );
  const totalSupply = await dlpPool.totalSupply();
  const name = await dlpPool.name();
  const decimals = await dlpPool.decimals();
  return {
    address: tokenAddress,
    name: name,
    symbol: name,
    totalSupply: totalSupply,
    decimals: decimals,
    staked: totalSupply / 10 ** decimals,
    unstaked: (await dlpPool.balanceOf(App.YOUR_ADDRESS)) / 10 ** decimals,
    token: originToken,
    balance: originToken.staked * 10 ** originToken.decimals,
    contract: dlpPool,
    tokens: [originTokenAddress],
  };
}

async function getMoonriverStoredToken(
  App,
  tokenAddress,
  stakingAddress,
  type
) {
  switch (type) {
    case "uniswap":
      const pool = new ethers.Contract(tokenAddress, UNI_ABI, App.provider);
      return await getMoonriverUniPool(App, pool, tokenAddress, stakingAddress);
    case "moonriverVault":
      const vault = new ethers.Contract(
        tokenAddress,
        MOVR_VAULT_TOKEN_ABI,
        App.provider
      );
      return await getMoonriverVault(App, vault, tokenAddress, stakingAddress);
    case "moonriverWantVault":
      const wantVault = new ethers.Contract(
        tokenAddress,
        MOVR_VAULT_WANT_ABI,
        App.provider
      );
      return await getMoonriverWantVault(
        App,
        wantVault,
        tokenAddress,
        stakingAddress
      );
    case "dlp":
      const dlpPool = new ethers.Contract(
        tokenAddress,
        MOVR_DLP_ABI,
        App.provider
      );
      const originTokenAddress = await dlpPool.originToken();
      return await getMoonriverDlpPool(
        App,
        dlpPool,
        tokenAddress,
        originTokenAddress,
        stakingAddress
      );
    case "erc20":
      const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, App.provider);
      return await geterc20(App, erc20, tokenAddress, stakingAddress);
    default:
      throw new Error("Unsupported token's type");
  }
}

async function getMoonriverToken(App, tokenAddress, stakingAddress) {
  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    return getercMoonriver20(App, null, tokenAddress, "");
  }
  const type = window.localStorage.getItem(tokenAddress);
  if (type)
    return getMoonriverStoredToken(App, tokenAddress, stakingAddress, type);
  try {
    const pool = new ethers.Contract(tokenAddress, UNI_ABI, App.provider);
    // const _token0 = await pool.token0();
    const uniPool = await getMoonriverUniPool(
      App,
      pool,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "uniswap");
    return uniPool;
  } catch (err) {}
  try {
    const pool = new ethers.Contract(tokenAddress, MOVR_DLP_ABI, App.provider);
    const originTokenAddress = await pool.originToken();
    const dlpPool = await getMoonriverDlpPool(
      App,
      pool,
      tokenAddress,
      originTokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "dlp");
    return dlpPool;
  } catch (err) {}
  try {
    const VAULT = new ethers.Contract(
      tokenAddress,
      MOVR_VAULT_TOKEN_ABI,
      App.provider
    );
    // const _token = await VAULT.token();
    const vault = await getMoonriverVault(
      App,
      VAULT,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "moonriverVault");
    return vault;
  } catch (err) {}
  try {
    const WANT_VAULT = new ethers.Contract(
      tokenAddress,
      MOVR_VAULT_WANT_ABI,
      App.provider
    );
    // const _want = await WANT_VAULT.want();
    const wantVault = await getMoonriverWantVault(
      App,
      WANT_VAULT,
      tokenAddress,
      stakingAddress
    );
    window.localStorage.setItem(tokenAddress, "moonriverWantVault");
    return wantVault;
  } catch (err) {}
  try {
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, App.provider);
    // const _name = await erc20.name();
    const erc20tok = await geterc20(App, erc20, tokenAddress, stakingAddress);
    window.localStorage.setItem(tokenAddress, "erc20");
    return erc20tok;
  } catch (err) {
    console.log(err);
    console.log(`Couldn't match ${tokenAddress} to any known token type.`);
  }
}

// async function loadMoonriverSynthetixPoolInfo(
//   App,
//   tokens,
//   prices,
//   stakingAbi,
//   stakingAddress,
//   rewardTokenFunction,
//   stakeTokenFunction
// ) {
//   const STAKING_POOL = new ethers.Contract(
//     stakingAddress,
//     stakingAbi,
//     App.provider
//   );

//   if (!STAKING_POOL.callStatic[stakeTokenFunction]) {
//     console.log("Couldn't find stake function ", stakeTokenFunction);
//   }
//   const stakeTokenAddress = await STAKING_POOL.callStatic[stakeTokenFunction]();

//   const rewardTokenAddress = await STAKING_POOL.callStatic[
//     rewardTokenFunction
//   ]();

//   var stakeToken = await getMoonriverToken(
//     App,
//     stakeTokenAddress,
//     stakingAddress
//   );

//   if (stakeTokenAddress.toLowerCase() === rewardTokenAddress.toLowerCase()) {
//     stakeToken.staked =
//       (await STAKING_POOL.totalSupply()) / 10 ** stakeToken.decimals;
//   }

//   var newPriceAddresses = stakeToken.tokens.filter(
//     (x) => !getParameterCaseInsensitive(prices, x)
//   );
//   var newPrices = await lookUpTokenPrices(newPriceAddresses);
//   for (const key in newPrices) {
//     if (newPrices[key]?.usd) prices[key] = newPrices[key];
//   }
//   var newTokenAddresses = stakeToken.tokens.filter(
//     (x) => !getParameterCaseInsensitive(tokens, x)
//   );
//   for (const address of newTokenAddresses) {
//     tokens[address] = await getMoonriverToken(App, address, stakingAddress);
//   }
//   if (!getParameterCaseInsensitive(tokens, rewardTokenAddress)) {
//     tokens[rewardTokenAddress] = await getMoonriverToken(
//       App,
//       rewardTokenAddress,
//       stakingAddress
//     );
//   }
//   const rewardToken = getParameterCaseInsensitive(tokens, rewardTokenAddress);

//   const rewardTokenTicker = rewardToken.symbol;

//   const poolPrices = getPoolPrices(tokens, prices, stakeToken, "moonriver");

//   if (!poolPrices) {
//     console.log(`Couldn't calculate prices for pool ${stakeTokenAddress}`);
//     return null;
//   }

//   const stakeTokenTicker = poolPrices.stakeTokenTicker;

//   const stakeTokenPrice =
//     prices[stakeTokenAddress]?.usd ??
//     getParameterCaseInsensitive(prices, stakeTokenAddress)?.usd;
//   const rewardTokenPrice = getParameterCaseInsensitive(
//     prices,
//     rewardTokenAddress
//   )?.usd;

//   const periodFinish = await STAKING_POOL.periodFinish();
//   const rewardRate = await STAKING_POOL.rewardRate();
//   //const weeklyRewards = (Date.now() / 1000 > periodFinish) ? 0 : rewardRate / 1e18 * 604800;
//   const weeklyRewards =
//     Date.now() / 1000 > periodFinish
//       ? 0
//       : (rewardRate / 10 ** rewardToken.decimals) * 604800;

//   const usdPerWeek = weeklyRewards * rewardTokenPrice;

//   const staked_tvl = poolPrices.staked_tvl;

//   const userStaked =
//     (await STAKING_POOL.balanceOf(App.YOUR_ADDRESS)) /
//     10 ** stakeToken.decimals;

//   const userUnstaked = stakeToken.unstaked;

//   const earned =
//     (await STAKING_POOL.earned(App.YOUR_ADDRESS)) / 10 ** rewardToken.decimals;

//   return {
//     stakingAddress,
//     poolPrices,
//     stakeTokenAddress,
//     rewardTokenAddress,
//     stakeTokenTicker,
//     rewardTokenTicker,
//     stakeTokenPrice,
//     rewardTokenPrice,
//     weeklyRewards,
//     usdPerWeek,
//     staked_tvl,
//     userStaked,
//     userUnstaked,
//     earned,
//   };
// }

// async function loadMoonriverSynthetixPool(
//   App,
//   tokens,
//   prices,
//   abi,
//   address,
//   rewardTokenFunction,
//   stakeTokenFunction
// ) {
//   const info = await loadMoonriverSynthetixPoolInfo(
//     App,
//     tokens,
//     prices,
//     abi,
//     address,
//     rewardTokenFunction,
//     stakeTokenFunction
//   );
//   if (!info) return null;
//   return await printSynthetixPool(App, info, "moonriver");
// }

// async function loadMoonriverBasisFork(data) {
//   const App = await init_ethers();

//   _print(`Initialized ${App.YOUR_ADDRESS}`);
//   _print("Reading smart contracts...\n");

//   var tokens = {};
//   var prices = {};
//   var totalStaked = 0;

//   let p1 = await loadMoonriverSynthetixPool(
//     App,
//     tokens,
//     prices,
//     data.PoolABI,
//     data.SharePool.address,
//     data.SharePool.rewardToken,
//     data.SharePool.stakeToken
//   );
//   totalStaked += p1.staked_tvl;

//   if (data.SharePool2) {
//     let p3 = await loadMoonriverSynthetixPool(
//       App,
//       tokens,
//       prices,
//       data.PoolABI,
//       data.SharePool2.address,
//       data.SharePool2.rewardToken,
//       data.SharePool2.stakeToken
//     );
//     totalStaked += p3.staked_tvl;
//   }

//   let p2 = await loadMoonriverSynthetixPool(
//     App,
//     tokens,
//     prices,
//     data.PoolABI,
//     data.CashPool.address,
//     data.CashPool.rewardToken,
//     data.CashPool.stakeToken
//   );
//   totalStaked += p2.staked_tvl;

//   if (data.SeedBanks) {
//     let p = await loadMultipleMoonriverSynthetixPools(
//       App,
//       tokens,
//       prices,
//       data.SeedBanks
//     );
//     totalStaked += p.staked_tvl;
//     if (p.totalUserStaked > 0) {
//       _print(
//         `You are staking a total of $${formatMoney(
//           p.totalUserStaked
//         )} at an APR of ${(p.totalApr * 100).toFixed(2)}%\n`
//       );
//     }
//   }

//   if (!data.SeedBanks) {
//     if (data.Boardrooms) {
//       for (const boardroom of data.Boardrooms) {
//         let br = await loadBoardroom(
//           App,
//           prices,
//           boardroom.address,
//           data.Oracle,
//           data.UniswapLP,
//           data.Cash,
//           data.ShareTicker,
//           data.CashTicker,
//           data.ExpansionsPerDay,
//           data.MaximumExpansion,
//           data.Decimals,
//           boardroom.ratio,
//           data.TargetMantissa
//         );
//         totalStaked += br.staked_tvl;
//       }
//     } else {
//       let br = await loadBoardroom(
//         App,
//         prices,
//         data.Boardroom,
//         data.Oracle,
//         data.UniswapLP,
//         data.Cash,
//         data.ShareTicker,
//         data.CashTicker,
//         data.ExpansionsPerDay,
//         data.MaximumExpansion,
//         data.Decimals,
//         1,
//         data.TargetMantissa
//       );
//       totalStaked += br.staked_tvl;
//     }
//   }

//   _print_bold(`Total staked: $${formatMoney(totalStaked)}`);

//   hideLoading();
// }

async function getMoonriverPoolInfo(
  app,
  chefContract,
  chefAddress,
  poolIndex,
  pendingRewardsFunction
) {
  const poolInfo = await chefContract.poolInfo(poolIndex);
  if (poolInfo.allocPoint === 0) {
    return {
      address: poolInfo.lpToken,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken: null,
      userStaked: 0,
      pendingRewardTokens: 0,
    };
  }
  const poolToken = await getMoonriverToken(
    app,
    poolInfo.lpToken ?? poolInfo.token ?? poolInfo.stakingToken,
    chefAddress
  );
  const userInfo = await chefContract.userInfo(poolIndex, app.YOUR_ADDRESS);
  const pendingRewardTokens = await chefContract.callStatic[
    pendingRewardsFunction
  ](poolIndex, app.YOUR_ADDRESS);
  const staked = userInfo.amount / 10 ** poolToken.decimals;
  return {
    address: poolInfo.lpToken ?? poolInfo.token ?? poolInfo.stakingToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    userStaked: staked,
    pendingRewardTokens: pendingRewardTokens / 10 ** 18,
    depositFee: (poolInfo.depositFeeBP ?? 0) / 100,
    withdrawFee: (poolInfo.withdrawFeeBP ?? 0) / 100,
  };
}

async function loadMoonriverChefContract(
  App,
  tokens,
  prices,
  chef,
  chefAddress,
  chefAbi,
  rewardTokenTicker,
  rewardTokenFunction,
  rewardsPerBlockFunction,
  rewardsPerWeekFixed,
  pendingRewardsFunction,
  deathPoolIndices,
  claimFunction
) {
  const chefContract =
    chef ?? new ethers.Contract(chefAddress, chefAbi, App.provider);

  const poolCount = parseInt(await chefContract.poolLength(), 10);
  const totalAllocPoints = await chefContract.totalAllocPoint();

  _print(
    `<a href='https://moonriver.moonscan.io/address/${chefAddress}' target='_blank'>Staking Contract</a>`
  );
  _print(`Found ${poolCount} pools.\n`);

  _print(`Showing incentivized pools only.\n`);

  const rewardTokenAddress = await chefContract.callStatic[
    rewardTokenFunction
  ]();
  const rewardToken = await getMoonriverToken(
    App,
    rewardTokenAddress,
    chefAddress
  );
  const rewardsPerWeek =
    rewardsPerWeekFixed ??
    (((await chefContract.callStatic[rewardsPerBlockFunction]()) /
      10 ** rewardToken.decimals) *
      604800) /
      3;

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) =>
        await getMoonriverPoolInfo(
          App,
          chefContract,
          chefAddress,
          x,
          pendingRewardsFunction
        )
    )
  );

  var tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens)
  );

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getMoonriverToken(App, address, chefAddress);
    })
  );

  if (deathPoolIndices) {
    //load prices for the deathpool assets
    deathPoolIndices
      .map((i) => poolInfos[i])
      .map((poolInfo) =>
        poolInfo.poolToken
          ? getPoolPrices(tokens, prices, poolInfo.poolToken, "moonriver")
          : undefined
      );
  }

  const poolPrices = poolInfos.map((poolInfo) =>
    poolInfo.poolToken
      ? getPoolPrices(tokens, prices, poolInfo.poolToken, "moonriver")
      : undefined
  );

  _print("Finished reading smart contracts.\n");

  let aprs = [];
  for (let i = 0; i < poolCount; i++) {
    if (poolPrices[i]) {
      const apr = printChefPool(
        App,
        chefAbi,
        chefAddress,
        prices,
        tokens,
        poolInfos[i],
        i,
        poolPrices[i],
        totalAllocPoints,
        rewardsPerWeek,
        rewardTokenTicker,
        rewardTokenAddress,
        pendingRewardsFunction,
        null,
        claimFunction,
        "moonriver",
        poolInfos[i].depositFee,
        poolInfos[i].withdrawFee
      );
      aprs.push(apr);
    }
  }
  let totalUserStaked = 0,
    totalStaked = 0,
    averageApr = 0;
  for (const a of aprs) {
    if (!isNaN(a.totalStakedUsd)) {
      totalStaked += a.totalStakedUsd;
    }
    if (a.userStakedUsd > 0) {
      totalUserStaked += a.userStakedUsd;
      averageApr += (a.userStakedUsd * a.yearlyAPR) / 100;
    }
  }
  averageApr = averageApr / totalUserStaked;
  _print(`Total Staked: $${formatMoney(totalStaked)}`);
  if (totalUserStaked > 0) {
    _print(
      `\nYou are staking a total of $${formatMoney(
        totalUserStaked
      )} at an average APR of ${(averageApr * 100).toFixed(2)}%`
    );
    _print(
      `Estimated earnings:` +
        ` Day $${formatMoney((totalUserStaked * averageApr) / 365)}` +
        ` Week $${formatMoney((totalUserStaked * averageApr) / 52)}` +
        ` Year $${formatMoney(totalUserStaked * averageApr)}\n`
    );
  }
  return { prices, totalUserStaked, totalStaked, averageApr };
}

// async function loadMultipleMoonriverSynthetixPools(App, tokens, prices, pools) {
//   let totalStaked = 0,
//     totalUserStaked = 0,
//     individualAPRs = [];
//   const infos = await Promise.all(
//     pools.map((p) =>
//       loadMoonriverSynthetixPoolInfo(
//         App,
//         tokens,
//         prices,
//         p.abi,
//         p.address,
//         p.rewardTokenFunction,
//         p.stakeTokenFunction
//       )
//     )
//   );
//   for (const i of infos) {
//     let p = await printSynthetixPool(App, i, "moonriver");
//     totalStaked += p.staked_tvl || 0;
//     totalUserStaked += p.userStaked || 0;
//     if (p.userStaked > 0) {
//       individualAPRs.push((p.userStaked * p.apr) / 100);
//     }
//   }
//   let totalApr =
//     totalUserStaked == 0
//       ? 0
//       : individualAPRs.reduce((x, y) => x + y, 0) / totalUserStaked;
//   return { staked_tvl: totalStaked, totalUserStaked, totalApr };
// }

// async function loadMultipleMoonriverSynthetixPoolsSequential(
//   App,
//   tokens,
//   prices,
//   pools
// ) {
//   let totalStaked = 0,
//     totalUserStaked = 0,
//     individualAPRs = [];
//   for (const p of pools) {
//     let res = await loadMoonriverSynthetixPool(
//       App,
//       tokens,
//       prices,
//       p.abi,
//       p.address,
//       p.rewardTokenFunction,
//       p.stakeTokenFunction
//     );
//     if (!res) continue;
//     totalStaked += res.staked_tvl || 0;
//     totalUserStaked += res.userStaked || 0;
//     if (res.userStaked > 0) {
//       individualAPRs.push((res.userStaked * res.apr) / 100);
//     }
//   }
//   let totalApr =
//     totalUserStaked == 0
//       ? 0
//       : individualAPRs.reduce((x, y) => x + y, 0) / totalUserStaked;
//   return { staked_tvl: totalStaked, totalUserStaked, totalApr };
// }

async function geterc20(App, token, address, stakingAddress) {
  // if (address === "0x0000000000000000000000000000000000000000") {
  //   return {
  //     address,
  //     name : "kcc",
  //     symbol : "kcc",
  //     totalSupply: 1e8,
  //     decimals: 18,
  //     staked: 0,
  //     unstaked: 0,
  //     contract: null,
  //     tokens:[address]
  //   }
  // }
  const decimals = await token.decimals()
  return {
      address,
      name : await token.name(),
      symbol : await token.symbol(),
      totalSupply : await token.totalSupply(),
      decimals : decimals,
      staked:  await token.balanceOf(stakingAddress) / 10 ** decimals,
      unstaked: await token.balanceOf(App.YOUR_ADDRESS)  / 10 ** decimals,
      contract: token,
      tokens : [address]
  };
}

export {
  getMoonriverPrices,
  getMoonriverToken,
  getMoonriverSpoonVault,
  getMoonriverPoolInfo,
  loadMoonriverChefContract
}