import { ethers } from "ethers";

export default class BSC {
  constructor() {
    this.name = "bsc";
    this.chainId = 56;
    this.jsonRpc = "https://bsc-dataseed1.binance.org";
  }

  async provider() {
    return new ethers.providers.JsonRpcProvider(this.jsonRpc);
  }
}
