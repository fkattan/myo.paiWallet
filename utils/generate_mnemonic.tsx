import * as Random from 'expo-random';

import "@ethersproject/shims";
import { ethers } from 'ethers';

const generateMnemonic = async () => {
    const randomBytes = await Random.getRandomBytesAsync(16);
    const mnemonic = ethers.utils.entropyToMnemonic(randomBytes)
    return mnemonic;
}

export default generateMnemonic;