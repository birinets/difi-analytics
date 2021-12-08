import { ethers } from "ethers";
import * as ethcall from "ethcall";

import {
  getPoolPrices,
  getParameterCaseInsensitive,
  formatMoney,
  printAPR
} from "../utils/ethers_helper";
import { getBscPrices, getBscToken } from "../utils/bsc_helpers";
import { _print, _print_bold } from "../utils/output";

import BELT_ABI from "../abis/belt_abi";

export default class Belt {
  constructor() {
    this.name = "Belt";
    this.networks = [
      {
        name: "bsc",
        address: "0xD4BbC80b9B102b77B21A06cb77E954049605E6c1",
        abi: BELT_ABI,
      },
    ];
  }

  async getData(network, account) {
    const { address, abi } = this._getConfig(network);
    const provider = await network.provider();
    const _contract = new ethers.Contract(address, abi, provider);

    const ethcallProvider = new ethcall.Provider();
    await ethcallProvider.init(provider);

    const app = {
      provider: await network.provider(),
      ethcallProvider: ethcallProvider,
      YOUR_ADDRESS: account,
    };

    const rewardsPerWeek =
      (((await _contract.BELTPerBlock()) / 1e18) * 604800) / 3;

    const tokens = {};
    const prices = await getBscPrices();
    prices["0x86aFa7ff694Ab8C985b79733745662760e454169"] = { usd: 1 };

    let data = await loadBeltChefContract(
      app,
      tokens,
      prices,
      _contract,
      address,
      abi,
      "BELT",
      "BELT",
      "BELTPerBlock",
      rewardsPerWeek,
      "pendingBELT"
    );

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

async function getBeltPoolInfo(
  App,
  chefContract,
  chefAddress,
  poolIndex,
  pendingRewardsFunction
) {
  const poolInfo = await chefContract.poolInfo(poolIndex);
  const stakingAddress = poolInfo.strat;
  if (poolInfo.allocPoint === 0) {
    return {
      address: poolInfo.want,
      allocPoints: poolInfo.allocPoint ?? 1,
      poolToken: null,
      userStaked: 0,
      pendingRewardTokens: 0,
      stakedToken: null,
      userLPStaked: 0,
      lastRewardBlock: poolInfo.lastRewardBlock,
    };
  }
  const poolToken = await getBscToken(App, poolInfo.want, stakingAddress);
  const stakedTokens = await chefContract.stakedWantTokens(
    poolIndex,
    App.YOUR_ADDRESS
  );
  const pendingRewardTokens = await chefContract.callStatic[
    pendingRewardsFunction
  ](poolIndex, App.YOUR_ADDRESS);
  const staked = stakedTokens / 10 ** poolToken.decimals;
  return {
    address: poolInfo.want,
    allocPoints: poolInfo.allocPoint ?? 1,
    poolToken: poolToken,
    userStaked: staked,
    pendingRewardTokens: pendingRewardTokens / 10 ** 18,
    lastRewardBlock: poolInfo.lastRewardBlock,
  };
}

async function loadBeltChefContract(
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
  deathPoolIndices
) {
  const chefContract =
    chef ?? new ethers.Contract(chefAddress, chefAbi, App.provider);

  const poolCount = parseInt(await chefContract.poolLength(), 10);
  const totalAllocPoints = await chefContract.totalAllocPoint();

  _print(
    `<a href='https://bscscan.com/address/${chefAddress}' target='_blank'>Staking Contract</a>`
  );
  _print(`Found ${poolCount} pools.\n`);

  _print(`Showing incentivized pools only.\n`);

  tokens = {};

  const rewardTokenAddress = await chefContract.callStatic[
    rewardTokenFunction
  ]();
  const rewardToken = await getBscToken(App, rewardTokenAddress, chefAddress);
  const rewardsPerWeek =
    rewardsPerWeekFixed ??
    (((await chefContract.callStatic[rewardsPerBlockFunction]()) /
      10 ** rewardToken.decimals) *
      604800) /
      3;

  const poolInfos = await Promise.all(
    [...Array(poolCount).keys()].map(
      async (x) =>
        await getBeltPoolInfo(
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
      tokens[address] = await getBscToken(App, address, chefAddress);
    })
  );

  if (deathPoolIndices) {
    //load prices for the deathpool assets
    deathPoolIndices
      .map((i) => poolInfos[i])
      .map((poolInfo) =>
        poolInfo.poolToken
          ? getPoolPrices(tokens, prices, poolInfo.poolToken, "bsc")
          : undefined
      );
  }

  const poolPrices = poolInfos.map((poolInfo) =>
    poolInfo.poolToken
      ? getPoolPrices(tokens, prices, poolInfo.poolToken, "bsc")
      : undefined
  );

  _print("Finished reading smart contracts.\n");

  let aprs = [];
  for (let i = 0; i < poolCount; i++) {
    if (poolPrices[i]) {
      const apr = printBeltPool(
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
        "bsc"
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

function printBeltPool(
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
  chain = "eth"
) {
  fixedDecimals = fixedDecimals ?? 2;
  const sp =
    poolInfo.stakedToken == null
      ? null
      : getPoolPrices(tokens, prices, poolInfo.stakedToken);
  var poolRewardsPerWeek =
    (poolInfo.allocPoints / totalAllocPoints) * rewardsPerWeek;
  if (poolRewardsPerWeek === 0) return;
  const userStaked = poolInfo.userLPStaked ?? poolInfo.userStaked;
  const rewardPrice = getParameterCaseInsensitive(
    prices,
    rewardTokenAddress
  )?.usd;
  const staked_tvl = sp?.staked_tvl ?? poolPrices.staked_tvl;
  poolPrices.print_price();
  sp?.print_price();
  const apr = printAPR(
    rewardTokenTicker,
    rewardPrice,
    poolRewardsPerWeek,
    poolPrices.stakeTokenTicker,
    staked_tvl,
    userStaked,
    poolPrices.price,
    fixedDecimals
  );
  if (poolInfo.userLPStaked > 0) sp?.print_contained_price(userStaked);
  if (poolInfo.userStaked > 0) poolPrices.print_contained_price(userStaked);
  // printBeltContractLinks(
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
  //   claimFunction,
  //   rewardPrice,
  //   chain
  // );
  return apr;
}
