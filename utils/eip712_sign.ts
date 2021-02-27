import { ethers } from "ethers";
import { TypedDataDomain } from "ethers-eip712";
import { L2_PAI_ADDRESS, L2_ACH_ADDRESS } from "../constants";

const signPermit = async (
  chainId: number,
  signerAddress: string,
  spender: string,
  wei: string,
  nonce: string,
  deadline: string,
  wallet: ethers.Wallet
) => {
  if (wallet === undefined) return undefined;

  const domain: TypedDataDomain = {
    name: "Peso Argentino Intangible",
    version: "1",
    chainId,
    verifyingContract: L2_PAI_ADDRESS,
  };

  const values: Record<string, any> = {
    owner: signerAddress,
    spender,
    value: wei,
    nonce,
    deadline,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const signature = await wallet._signTypedData(domain, types, values);
  return signature;
};

const signTransfer = async (
  chainId: number,
  sender: string,
  receiver: string,
  amount: string,
  fee: string,
  nonce: string,
  expiry: string,
  relayer: string,
  wallet: ethers.Wallet
) => {
  if (wallet === undefined) return undefined;

  const domain: TypedDataDomain = {
    name: "Automated Clearing House",
    version: "1",
    chainId,
    verifyingContract: L2_ACH_ADDRESS,
  };

  const values: Record<string, any> = {
    sender,
    receiver,
    amount,
    fee,
    nonce,
    expiry,
    relayer,
  };

  // TYPE_HASH = keccak "pay(address sender,address receiver,uint amount,uint fee,uint nonce,uint expiry,address relayer)"
  const types = {
    pay: [
      { name: "sender", type: "address" },
      { name: "receiver", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "fee", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "relayer", type: "address" },
    ],
  };

  const signature = await wallet._signTypedData(domain, types, values);
  return signature;
};

export { signPermit, signTransfer };
