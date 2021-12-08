import { ethers } from "ethers";

export default class Celo {
  constructor() {
    this.name = "celo";
    this.chainId = 42220;
    this.jsonRpc = "https://forno.celo.org";
  }

  async provider() {
    return new ethers.providers.JsonRpcProvider(this.jsonRpc);
  }
}
