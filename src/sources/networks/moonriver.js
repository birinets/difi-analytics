import { ethers } from "ethers";

export default class Moonriver {
  constructor() {
    this.name = "moonriver";
    this.chainId = 1285;
    this.jsonRpc = "https://rpc.moonriver.moonbeam.network";
  }

  async provider() {
    return new ethers.providers.JsonRpcProvider(this.jsonRpc);
  }
}
