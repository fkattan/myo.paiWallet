/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { L2PaiContract } from "./L2Pai";
import { PaiContract } from "./Pai";

declare global {
  namespace Truffle {
    interface Artifacts {
      require(name: "L2_PAI"): L2PaiContract;
      require(name: "PAI"): PaiContract;
    }
  }
}

export { L2PaiContract, L2PaiInstance } from "./L2Pai";
export { PaiContract, PaiInstance } from "./Pai";