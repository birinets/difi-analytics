import { ethers } from "ethers";
import * as ethcall from "ethcall";

import {
  loadChefContract,
  getPoolPrices,
  getParameterCaseInsensitive,
  formatMoney,
} from "../utils/ethers_helper";
import { getCeloToken, getCeloPrices } from "../utils/celo_helpers";
import {
  getMoonriverPrices,
  getMoonriverToken,
} from "../utils/moonriver_helpers";

import { _print, _print_bold } from "../utils/output";

import CELO_REWARDS_ABI from "../abis/celo_reward_abi";
import MOVR_REWARDS_ABI from "../abis/movr_reward_abi";
import SUSHISWAP_ABI from "../abis/sushiswap_abi";
import MOVR_SUSHISWAP_ABI from "../abis/movr_sushiswap_abi";
import CELO_SUSHISWAP_ABI from "../abis/celo_sushiswap_abi";

export default class Sushiswap {
  constructor() {
    this.name = "SushiSwap";
    this.networks = [
      // {
      //   name: "ethereum",
      //   address: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
      //   abi: SUSHISWAP_ABI,
      // },
      {
        name: "celo",
        address: "0x0769fd68dFb93167989C6f7254cd0D766Fb2841F",
        tokenAddress: "0x471ece3750da237f93b8e339c536989b8978a438",
        abi: CELO_SUSHISWAP_ABI,
      },
      {
        name: "moonriver",
        address: "0x3dB01570D97631f69bbb0ba39796865456Cf89A5",
        rewardsTokenAddress: "0x1334c8e873e1cae8467156e2a81d1c8b566b2da1",
        tokenAddress: "0x98878B06940aE243284CA214f92Bb71a2b032B8A",
        abi: MOVR_SUSHISWAP_ABI,
      },
    ];
  }

  async getData(network, account) {
    const { address, abi, rewardsTokenAddress, tokenAddress } =
      this._getConfig(network);
    const provider = await network.provider();
    const _contract = new ethers.Contract(address, abi, provider);

    const ethcallProvider = new ethcall.Provider();
    await ethcallProvider.init(provider);

    const app = {
      provider: await network.provider(),
      ethcallProvider: ethcallProvider,
      YOUR_ADDRESS: account,
    };

    let data = {};
    if (network.name === "ethereum") {
      const rewardsPerWeekFixed =
        (((await _contract.sushiPerBlock()) / 1e18) * 604800) / 13.5;

      data = await loadChefContract(
        app,
        _contract,
        address,
        abi,
        "SUSHI",
        "sushi",
        null,
        rewardsPerWeekFixed,
        "pendingSushi",
        null,
        null,
        true
      );
    } else if (network.name === "celo") {
      const rewardsPerWeek =
        ((await _contract.sushiPerSecond()) / 1e18) * 604800;

      const _celoRewardsAddress = await _contract.rewarder(0);
      const _celoRewardsContract = new ethers.Contract(
        _celoRewardsAddress,
        CELO_REWARDS_ABI,
        provider
      );
      const celoRewardsPerWeek =
        ((await _celoRewardsContract.rewardPerSecond()) / 1e18) * 604800;

      const tokens = {};
      const prices = await getCeloPrices();

      data = await loadCeloSushiContract(
        app,
        tokens,
        prices,
        _contract,
        address,
        abi,
        "SUSHI",
        "SUSHI",
        null,
        rewardsPerWeek,
        "pendingSushi",
        [0],
        _celoRewardsContract,
        _celoRewardsAddress,
        CELO_REWARDS_ABI,
        "WCELO",
        tokenAddress,
        celoRewardsPerWeek
      );
    } else if (network.name === "moonriver") {
      const rewardsPerWeek =
        ((await _contract.sushiPerSecond()) / 1e18) * 604800;

      const _movrRewardsContract = new ethers.Contract(
        rewardsTokenAddress,
        MOVR_REWARDS_ABI,
        provider
      );
      const moonriverRewardsPerWeek =
        ((await _movrRewardsContract.rewardPerSecond()) / 1e18) * 604800;

      const tokens = {};
      const prices = await getMoonriverPrices();
      data = await loadMoonriverSushiContract(
        app,
        tokens,
        prices,
        _contract,
        address,
        abi,
        "SUSHI",
        "SUSHI",
        null,
        rewardsPerWeek,
        "pendingSushi",
        [1],
        _movrRewardsContract,
        rewardsTokenAddress,
        MOVR_REWARDS_ABI,
        "MOVR",
        tokenAddress,
        moonriverRewardsPerWeek
      );
    }

    return {
      protocol: this,
      network: network,
      pools: data,
    };
  }

  _getConfig(network) {
    const config = this.networks.find((n) => n.name === network.name);
    if (!config) {
      throw new Error(`Network ${network?.name} is not supported`);
    }

    return config;
  }
}

async function loadCeloSushiContract(
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
  chefCeloRewardsContract,
  chefCeloRewardsAddress,
  chefCeloRewardsAbi,
  rewardCeloTicker,
  celoTokenAddress,
  celoRewardsPerWeek
) {
  const chefContract =
    chef ?? new ethers.Contract(chefAddress, chefAbi, App.provider);

  const poolCount = parseInt(await chefContract.poolLength(), 10);
  const totalAllocPoints = await chefContract.totalAllocPoint();

  _print(`====================== Sushi Celo ===========================\n`);

  _print(`Found ${poolCount} pools.\n`);

  tokens = {};

  const rewardTokenAddress = await chefContract.callStatic[
    rewardTokenFunction
  ]();
  const rewardToken = await getCeloToken(App, rewardTokenAddress, chefAddress);
  const rewardsPerWeek =
    rewardsPerWeekFixed ??
    (((await chefContract.callStatic[rewardsPerBlockFunction]()) /
      10 ** rewardToken.decimals) *
      604800) /
      3;

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) =>
        await getCeloSushiPoolInfo(
          App,
          chefContract,
          chefAddress,
          x,
          pendingRewardsFunction,
          chefCeloRewardsContract,
          chefCeloRewardsAddress
        )
    )
  );

  var tokenAddresses = [].concat.apply(
    [],
    poolInfos.filter((x) => x.poolToken).map((x) => x.poolToken.tokens)
  );

  await Promise.all(
    tokenAddresses.map(async (address) => {
      tokens[address] = await getCeloToken(App, address, chefAddress);
    })
  );

  if (deathPoolIndices) {
    //load prices for the deathpool assets
    deathPoolIndices
      .map((i) => poolInfos[i])
      .map((poolInfo) =>
        poolInfo.poolToken
          ? getPoolPrices(tokens, prices, poolInfo.poolToken, "celo")
          : undefined
      );
  }

  const poolPrices = poolInfos.map((poolInfo) =>
    poolInfo.poolToken
      ? getPoolPrices(tokens, prices, poolInfo.poolToken, "celo")
      : undefined
  );

  _print("Finished reading smart contracts.\n");

  let aprs = [];
  for (let i = 0; i < poolCount; i++) {
    const userStaked = poolInfos[i].userLPStaked ?? poolInfos[i].userStaked;
    if (poolPrices[i] && (userStaked > 0) ) {
      const apr = printCeloSushiPool(
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
        null,
        "celo",
        chefCeloRewardsAbi,
        chefCeloRewardsAddress,
        celoRewardsPerWeek,
        rewardCeloTicker,
        celoTokenAddress,
        poolInfos[i].pendingCeloTokens
      );
      aprs.push(apr);
    }
  }
  let totalUserStaked = 0,
    totalStaked = 0,
    averageApr = 0;
  for (const a of aprs) {
    if (!a) continue;
    if (!isNaN(a.totalStakedUsd)) {
      totalStaked += a.totalStakedUsd;
    }
    if (a.userStakedUsd > 0) {
      totalUserStaked += a.userStakedUsd;
      averageApr += (a.userStakedUsd * a.yearlyAPR) / 100;
    }
  }
  averageApr = averageApr / totalUserStaked;
  _print_bold(`Total Staked: $${formatMoney(totalStaked)}`);
  if (totalUserStaked > 0) {
    _print_bold(
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

async function getCeloSushiPoolInfo(
  app,
  chefContract,
  chefAddress,
  poolIndex,
  pendingRewardsFunction,
  chefCeloRewardsContract,
  chefCeloRewardsAddress
) {
  const poolInfo = await chefContract.poolInfo(poolIndex);
  const lpToken = await chefContract.lpToken(poolIndex);
  if (poolInfo.allocPoint === 0) {
    return {
      address: lpToken,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken: null,
      userStaked: 0,
      pendingRewardTokens: 0,
    };
  }
  const poolToken = await getCeloToken(app, lpToken, chefAddress);
  const userInfo = await chefContract.userInfo(poolIndex, app.YOUR_ADDRESS);
  //const userInfoMatic = await chefMaticRewardsContract.userInfo(poolIndex, app.YOUR_ADDRESS);
  const pendingRewardTokens = await chefContract.callStatic[
    pendingRewardsFunction
  ](poolIndex, app.YOUR_ADDRESS);
  const pendingCeloTokens = await chefCeloRewardsContract.pendingToken(
    poolIndex,
    app.YOUR_ADDRESS
  );
  const staked = userInfo.amount / 10 ** poolToken.decimals;
  return {
    address: lpToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    userStaked: staked,
    pendingRewardTokens: pendingRewardTokens / 10 ** 18,
    pendingCeloTokens: pendingCeloTokens / 10 ** 18,
  };
}

function printCeloSushiPool(
  App,
  chefAbi,
  chefAddr,
  prices,
  tokens,
  poolInfo,
  poolIndex,
  poolPrices,
  totalAllocPoints,
  rewardsPerWeek,
  rewardTokenTicker,
  rewardTokenAddress,
  pendingRewardsFunction,
  fixedDecimals,
  claimFunction,
  chain = "celo",
  chefCeloRewardsAbi,
  chefCeloRewardsAddress,
  celoRewardsPerWeek,
  rewardCeloTicker,
  celoTokenAddress,
  pendingCeloTokens
) {
  fixedDecimals = fixedDecimals ?? 2;
  const sp =
    poolInfo.stakedToken == null
      ? null
      : getPoolPrices(tokens, prices, poolInfo.stakedToken);
  var poolRewardsPerWeek =
    (poolInfo.allocPoints / totalAllocPoints) * rewardsPerWeek;
  let poolCeloRewardsPerWeek =
    (poolInfo.allocPoints / totalAllocPoints) * celoRewardsPerWeek;
  if (poolRewardsPerWeek === 0 && rewardsPerWeek !== 0) return;
  const userStaked = poolInfo.userLPStaked ?? poolInfo.userStaked;
  const rewardPrice = getParameterCaseInsensitive(
    prices,
    rewardTokenAddress
  )?.usd;
  const rewardCeloPrice = getParameterCaseInsensitive(
    prices,
    celoTokenAddress
  )?.usd;
  const staked_tvl = sp?.staked_tvl ?? poolPrices.staked_tvl;
  poolPrices.print_price(chain);
  sp?.print_price(chain);
  const apr = printCeloSushiAPR(
    rewardTokenTicker,
    rewardPrice,
    poolRewardsPerWeek,
    poolPrices.stakeTokenTicker,
    staked_tvl,
    userStaked,
    poolPrices.price,
    fixedDecimals,
    poolCeloRewardsPerWeek,
    rewardCeloPrice,
    rewardCeloTicker
  );
  if (poolInfo.userLPStaked > 0) sp?.print_contained_price(userStaked);
  if (poolInfo.userStaked > 0) poolPrices.print_contained_price(userStaked);
  // printSushiContractLinks(
  //   App,
  //   chefAbi,
  //   chefAddr,
  //   poolIndex,
  //   poolInfo.address,
  //   pendingRewardsFunction,
  //   rewardTokenTicker,
  //   poolPrices.stakeTokenTicker,
  //   poolInfo.poolToken.unstaked,
  //   poolInfo.userStaked,
  //   poolInfo.pendingRewardTokens,
  //   fixedDecimals,
  //   rewardPrice,
  //   pendingCeloTokens,
  //   rewardCeloTicker,
  //   rewardCeloPrice
  // );
  _print("");
  return apr;
}

function printCeloSushiAPR(
  rewardTokenTicker,
  rewardPrice,
  poolRewardsPerWeek,
  stakeTokenTicker,
  staked_tvl,
  userStaked,
  poolTokenPrice,
  fixedDecimals,
  poolCeloRewardsPerWeek,
  rewardCeloPrice,
  rewardCeloTicker
) {
  var usdPerWeek = poolRewardsPerWeek * rewardPrice;
  var usdCeloPerWeek = poolCeloRewardsPerWeek * rewardCeloPrice;
  fixedDecimals = fixedDecimals ?? 2;
  _print(
    `${rewardTokenTicker} Per Week: ${poolRewardsPerWeek.toFixed(
      fixedDecimals
    )} ($${formatMoney(usdPerWeek)})`
  );
  _print(
    `${rewardCeloTicker} Per Week: ${poolCeloRewardsPerWeek.toFixed(
      fixedDecimals
    )} ($${formatMoney(usdCeloPerWeek)})`
  );
  var weeklyAPR = (usdPerWeek / staked_tvl) * 100;
  var dailyAPR = weeklyAPR / 7;
  var yearlySushiAPR = weeklyAPR * 52;
  var weeklyCeloAPR = (usdCeloPerWeek / staked_tvl) * 100;
  var dailyCeloAPR = weeklyCeloAPR / 7;
  var yearlyCeloAPR = weeklyCeloAPR * 52;
  let totalDailyAPR = dailyAPR + dailyCeloAPR;
  let totalWeeklyAPR = weeklyAPR + weeklyCeloAPR;
  let totalYearlyAPR = yearlySushiAPR + yearlyCeloAPR;
  let totalUSDPerWeek = usdPerWeek + usdCeloPerWeek;
  _print(
    `APR SUSHI: Day ${dailyAPR.toFixed(2)}% Week ${weeklyAPR.toFixed(
      2
    )}% Year ${yearlySushiAPR.toFixed(2)}%`
  );
  _print(
    `APR WCELO: Day ${dailyCeloAPR.toFixed(2)}% Week ${weeklyCeloAPR.toFixed(
      2
    )}% Year ${yearlyCeloAPR.toFixed(2)}%`
  );
  var userStakedUsd = userStaked * poolTokenPrice;
  var userStakedPct = (userStakedUsd / staked_tvl) * 100;
  _print(`Total Per Week: $${formatMoney(totalUSDPerWeek)}`);
  _print(
    `Total APR: Day ${totalDailyAPR.toFixed(4)}% Week ${totalWeeklyAPR.toFixed(
      2
    )}% Year ${totalYearlyAPR.toFixed(2)}%`
  );
  _print(
    `You are staking ${userStaked.toFixed(
      fixedDecimals
    )} ${stakeTokenTicker} ($${formatMoney(
      userStakedUsd
    )}), ${userStakedPct.toFixed(2)}% of the pool.`
  );
  var userWeeklyRewards = (userStakedPct * poolRewardsPerWeek) / 100;
  var userCeloWeeklyRewards = (userStakedPct * poolCeloRewardsPerWeek) / 100;
  var userDailyRewards = userWeeklyRewards / 7;
  var userCeloDailyRewards = userCeloWeeklyRewards / 7;
  var userYearlyRewards = userWeeklyRewards * 52;
  var userCeloYearlyRewards = userCeloWeeklyRewards * 52;
  if (userStaked > 0) {
    _print(
      `Estimated Total earnings:` +
        ` Day ($${formatMoney(
          userDailyRewards * rewardPrice +
            userCeloDailyRewards * rewardCeloPrice
        )})` +
        ` Week ($${formatMoney(
          userWeeklyRewards * rewardPrice +
            userCeloWeeklyRewards * rewardCeloPrice
        )})` +
        ` Year ($${formatMoney(
          userYearlyRewards * rewardPrice +
            userCeloYearlyRewards * rewardCeloPrice
        )})`
    );
  }
  return {
    userStakedUsd,
    totalStakedUsd: staked_tvl,
    userStakedPct,
    yearlyAPR: totalYearlyAPR,
    userYearlyUsd:
      userYearlyRewards * rewardPrice + userCeloYearlyRewards * rewardCeloPrice,
  };
}

// function printSushiContractLinks(
//   App,
//   chefAbi,
//   chefAddr,
//   poolIndex,
//   poolAddress,
//   pendingRewardsFunction,
//   rewardTokenTicker,
//   stakeTokenTicker,
//   unstaked,
//   userStaked,
//   pendingRewardTokens,
//   fixedDecimals,
//   rewardTokenPrice,
//   pendingCeloTokens,
//   rewardCeloTicker,
//   rewardCeloPrice
// ) {
//   fixedDecimals = fixedDecimals ?? 2;
//   const approveAndStake = async function () {
//     return chefContract_stake(chefAbi, chefAddr, poolIndex, poolAddress, App);
//   };
//   const unstake = async function () {
//     return sushiContract_unstake(chefAbi, chefAddr, poolIndex, App);
//   };
//   const claim = async function () {
//     return sushiContract_claim(chefAbi, chefAddr, poolIndex, App);
//   };
//   _print_link(
//     `Stake ${unstaked.toFixed(fixedDecimals)} ${stakeTokenTicker}`,
//     approveAndStake
//   );
//   _print_link(
//     `Unstake ${userStaked.toFixed(fixedDecimals)} ${stakeTokenTicker}`,
//     unstake
//   );
//   _print_link(
//     `Claim ${pendingRewardTokens.toFixed(
//       fixedDecimals
//     )} ${rewardTokenTicker} ($${formatMoney(
//       pendingRewardTokens * rewardTokenPrice
//     )}) + ${pendingCeloTokens.toFixed(
//       fixedDecimals
//     )} ${rewardCeloTicker} ($${formatMoney(
//       pendingCeloTokens * rewardCeloPrice
//     )})`,
//     claim
//   );
//   _print(`Staking or unstaking also claims rewards.`);
// }

// const sushiContract_unstake = async function (
//   chefAbi,
//   chefAddress,
//   poolIndex,
//   App
// ) {
//   const signer = App.provider.getSigner();
//   const CHEF_CONTRACT = new ethers.Contract(chefAddress, chefAbi, signer);

//   const currentStakedAmount = (
//     await CHEF_CONTRACT.userInfo(poolIndex, App.YOUR_ADDRESS)
//   ).amount;
//   const earnedTokenAmount =
//     (await CHEF_CONTRACT.pendingSushi(poolIndex, App.YOUR_ADDRESS)) / 1e18;

//   if (earnedTokenAmount > 0) {
//     showLoading();
//     CHEF_CONTRACT.withdrawAndHarvest(
//       poolIndex,
//       currentStakedAmount,
//       App.YOUR_ADDRESS,
//       { gasLimit: 500000 }
//     )
//       .then(function (t) {
//         return App.provider.waitForTransaction(t.hash);
//       })
//       .catch(function () {
//         hideLoading();
//       });
//   }
// };

// const sushiContract_claim = async function (
//   chefAbi,
//   chefAddress,
//   poolIndex,
//   App
// ) {
//   const signer = App.provider.getSigner();

//   const CHEF_CONTRACT = new ethers.Contract(chefAddress, chefAbi, signer);

//   const earnedTokenAmount =
//     (await CHEF_CONTRACT.pendingSushi(poolIndex, App.YOUR_ADDRESS)) / 1e18;

//   if (earnedTokenAmount > 0) {
//     showLoading();
//     CHEF_CONTRACT.harvest(poolIndex, App.YOUR_ADDRESS, { gasLimit: 500000 })
//       .then(function (t) {
//         return App.provider.waitForTransaction(t.hash);
//       })
//       .catch(function () {
//         hideLoading();
//       });
//   }
// };

async function loadMoonriverSushiContract(
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
  chefMoonriverRewardsContract,
  chefMoonriverRewardsAddress,
  chefMoonriverRewardsAbi,
  rewardMoonriverTicker,
  moonriverTokenAddress,
  moonriverRewardsPerWeek
) {
  const chefContract =
    chef ?? new ethers.Contract(chefAddress, chefAbi, App.provider);

  const poolCount = parseInt(await chefContract.poolLength(), 10);
  const totalAllocPoints = await chefContract.totalAllocPoint();


  _print(`====================== Sushi Moonriver ===========================\n`);

  _print(`Found ${poolCount} pools.\n`);

  tokens = {};

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
        await getMoonriverSushiPoolInfo(
          App,
          chefContract,
          chefAddress,
          x,
          pendingRewardsFunction,
          chefMoonriverRewardsContract,
          chefMoonriverRewardsAddress
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
    // load prices for the deathpool assets
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
    const userStaked = poolInfos[i].userLPStaked ?? poolInfos[i].userStaked;
    if (poolPrices[i] && (userStaked > 0) ) {
      const apr = printMoonriverSushiPool(
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
        null,
        "moonriver",
        chefMoonriverRewardsAbi,
        chefMoonriverRewardsAddress,
        moonriverRewardsPerWeek,
        rewardMoonriverTicker,
        moonriverTokenAddress
      );
      aprs.push(apr);
    }
  }
  let totalUserStaked = 0,
    totalStaked = 0,
    averageApr = 0;
  for (const a of aprs) {
    if (!a) continue;
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

async function getMoonriverSushiPoolInfo(
  app,
  chefContract,
  chefAddress,
  poolIndex,
  pendingRewardsFunction,
  chefMoonriverRewardsContract,
  chefMoonriverRewardsAddress
) {
  const poolInfo = await chefContract.poolInfo(poolIndex);
  const lpToken = await chefContract.lpToken(poolIndex);
  if (poolInfo.allocPoint === 0) {
    return {
      address: lpToken,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken: null,
      userStaked: 0,
      pendingRewardTokens: 0,
    };
  }
  const poolToken = await getMoonriverToken(app, lpToken, chefAddress);
  const userInfo = await chefContract.userInfo(poolIndex, app.YOUR_ADDRESS);
  const pendingRewardTokens = await chefContract.callStatic[
    pendingRewardsFunction
  ](poolIndex, app.YOUR_ADDRESS);
  const pendingMoonriverTokens =
    await chefMoonriverRewardsContract.pendingToken(
      poolIndex,
      app.YOUR_ADDRESS
    );
  const staked = userInfo.amount / 10 ** poolToken.decimals;
  return {
    address: lpToken,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    userStaked: staked,
    pendingRewardTokens: pendingRewardTokens / 10 ** 18,
    pendingMoonriverTokens: pendingMoonriverTokens / 10 ** 18,
  };
}

function printMoonriverSushiPool(
  App,
  chefAbi,
  chefAddr,
  prices,
  tokens,
  poolInfo,
  poolIndex,
  poolPrices,
  totalAllocPoints,
  rewardsPerWeek,
  rewardTokenTicker,
  rewardTokenAddress,
  pendingRewardsFunction,
  fixedDecimals,
  claimFunction,
  chain = "moonriver",
  chefMoonriverRewardsAbi,
  chefMoonriverRewardsAddress,
  moonriverRewardsPerWeek,
  rewardMoonriverTicker,
  moonriverTokenAddress
) {
  fixedDecimals = fixedDecimals ?? 2;
  const sp =
    poolInfo.stakedToken == null
      ? null
      : getPoolPrices(tokens, prices, poolInfo.stakedToken);
  var poolRewardsPerWeek =
    (poolInfo.allocPoints / totalAllocPoints) * rewardsPerWeek;
  let poolMoonriverRewardsPerWeek =
    (poolInfo.allocPoints / totalAllocPoints) * moonriverRewardsPerWeek;
  if (poolRewardsPerWeek === 0 && rewardsPerWeek !== 0) return;
  const userStaked = poolInfo.userLPStaked ?? poolInfo.userStaked;
  const rewardPrice = getParameterCaseInsensitive(
    prices,
    rewardTokenAddress
  )?.usd;
  const rewardMoonriverPrice = getParameterCaseInsensitive(
    prices,
    moonriverTokenAddress
  )?.usd;
  const staked_tvl = sp?.staked_tvl ?? poolPrices.staked_tvl;
  poolPrices.print_price(chain);
  sp?.print_price(chain);
  const apr = printMoonriverSushiAPR(
    rewardTokenTicker,
    rewardPrice,
    poolRewardsPerWeek,
    poolPrices.stakeTokenTicker,
    staked_tvl,
    userStaked,
    poolPrices.price,
    fixedDecimals,
    poolMoonriverRewardsPerWeek,
    rewardMoonriverPrice,
    rewardMoonriverTicker
  );
  if (poolInfo.userLPStaked > 0) sp?.print_contained_price(userStaked);
  if (poolInfo.userStaked > 0) poolPrices.print_contained_price(userStaked);
  _print("");
  return apr;
}

function printMoonriverSushiAPR(
  rewardTokenTicker,
  rewardPrice,
  poolRewardsPerWeek,
  stakeTokenTicker,
  staked_tvl,
  userStaked,
  poolTokenPrice,
  fixedDecimals,
  poolMoonriverRewardsPerWeek,
  rewardMoonriverPrice,
  rewardMoonriverTicker
) {
  var usdPerWeek = poolRewardsPerWeek * rewardPrice;
  var usdMoonriverPerWeek = poolMoonriverRewardsPerWeek * rewardMoonriverPrice;
  fixedDecimals = fixedDecimals ?? 2;
  _print(
    `${rewardTokenTicker} Per Week: ${poolRewardsPerWeek.toFixed(
      fixedDecimals
    )} ($${formatMoney(usdPerWeek)})`
  );
  _print(
    `${rewardMoonriverTicker} Per Week: ${poolMoonriverRewardsPerWeek.toFixed(
      fixedDecimals
    )} ($${formatMoney(usdMoonriverPerWeek)})`
  );
  var weeklyAPR = (usdPerWeek / staked_tvl) * 100;
  var dailyAPR = weeklyAPR / 7;
  var yearlyAPR = weeklyAPR * 52;
  var weeklyMoonriverAPR = (usdMoonriverPerWeek / staked_tvl) * 100;
  var dailyMoonriverAPR = weeklyMoonriverAPR / 7;
  var yearlyMoonriverAPR = weeklyMoonriverAPR * 52;
  let totalDailyAPR = dailyAPR + dailyMoonriverAPR;
  let totalWeeklyAPR = weeklyAPR + weeklyMoonriverAPR;
  let totalYearlyAPR = yearlyAPR + yearlyMoonriverAPR;
  let totalUSDPerWeek = usdPerWeek + usdMoonriverPerWeek;
  _print(
    `APR SUSHI: Day ${dailyAPR.toFixed(2)}% Week ${weeklyAPR.toFixed(
      2
    )}% Year ${yearlyAPR.toFixed(2)}%`
  );
  _print(
    `APR MOVR: Day ${dailyMoonriverAPR.toFixed(
      2
    )}% Week ${weeklyMoonriverAPR.toFixed(
      2
    )}% Year ${yearlyMoonriverAPR.toFixed(2)}%`
  );
  var userStakedUsd = userStaked * poolTokenPrice;
  var userStakedPct = (userStakedUsd / staked_tvl) * 100;
  _print(`Total Per Week: $${formatMoney(totalUSDPerWeek)}`);
  _print(
    `Total APR: Day ${totalDailyAPR.toFixed(4)}% Week ${totalWeeklyAPR.toFixed(
      2
    )}% Year ${totalYearlyAPR.toFixed(2)}%`
  );
  _print(
    `You are staking ${userStaked.toFixed(
      fixedDecimals
    )} ${stakeTokenTicker} ($${formatMoney(
      userStakedUsd
    )}), ${userStakedPct.toFixed(2)}% of the pool.`
  );
  var userWeeklyRewards = (userStakedPct * poolRewardsPerWeek) / 100;
  var userMoonriverWeeklyRewards =
    (userStakedPct * poolMoonriverRewardsPerWeek) / 100;
  var userDailyRewards = userWeeklyRewards / 7;
  var userMoonriverDailyRewards = userMoonriverWeeklyRewards / 7;
  var userYearlyRewards = userWeeklyRewards * 52;
  var userMoonriverYearlyRewards = userMoonriverWeeklyRewards * 52;
  if (userStaked > 0) {
    _print(
      `Estimated ${rewardTokenTicker} earnings:` +
        ` Day ${(userDailyRewards + userMoonriverDailyRewards).toFixed(
          fixedDecimals
        )} ($${formatMoney(
          userDailyRewards * rewardPrice +
            userMoonriverDailyRewards * rewardMoonriverPrice
        )})` +
        ` Week ${(userWeeklyRewards + userMoonriverWeeklyRewards).toFixed(
          fixedDecimals
        )} ($${formatMoney(
          userWeeklyRewards * rewardPrice +
            userMoonriverWeeklyRewards * rewardMoonriverPrice
        )})` +
        ` Year ${(userYearlyRewards + userMoonriverYearlyRewards).toFixed(
          fixedDecimals
        )} ($${formatMoney(
          userYearlyRewards * rewardPrice +
            userMoonriverYearlyRewards * rewardMoonriverPrice
        )})`
    );
  }
  return {
    userStakedUsd,
    totalStakedUsd: staked_tvl,
    userStakedPct,
    yearlyAPR: totalYearlyAPR,
    userYearlyUsd:
      userYearlyRewards * rewardPrice +
      userMoonriverYearlyRewards * rewardMoonriverPrice,
  };
}
