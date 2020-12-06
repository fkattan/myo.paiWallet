import { ethers } from "ethers";
import { L2_PAI_ADDRESS, L2_PROVIDER_URL } from "../constants";

const eip712Sign = async (
  chainId: number,
  signerAddress: string,
  recipient: string,
  wei: string,
  nonce: string,
  deadline: string,
  wallet: ethers.Wallet
) => {
  if (wallet === undefined) return undefined;

  const provider = new ethers.providers.JsonRpcProvider(L2_PROVIDER_URL);
  const walletProvider = wallet.connect(provider);

  const domain = {
    name: "Peso Argentino Intangible",
    version: "1",
    chainId,
    verifyingContract: L2_PAI_ADDRESS,
  };

  const values: Record<string, any> = {
    owner: signerAddress,
    spender: recipient,
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

  // console.log("Payload", _TypedDataEncoder.getPayload(domain, types, values));

  const signature = await walletProvider._signTypedData(domain, types, values);
  const rsvSignature = ethers.utils.splitSignature(signature);

  return rsvSignature;
};

export default eip712Sign;
