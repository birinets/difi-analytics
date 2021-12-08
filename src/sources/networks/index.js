import Celo from "./celo";
import BSC from "./bsc";
import Ethereum from "./ethereum";
import Moonriver from "./moonriver";

const networks = [new Celo(), new Ethereum(), new Moonriver(), new BSC()];

export default networks;
