import { ethers } from "ethers";

export default class Ethereum {
  constructor() {
    this.name = "ethereum";
    this.chainId = 1;
    this.jsonRpc =
      "https://eth-mainnet.alchemyapi.io/v2/1bEk8GT3jpO8Dam4JxJdmU4y16C-MR5N";
  }

  async provider() {
    return new ethers.providers.JsonRpcProvider(this.jsonRpc);
  }
}
