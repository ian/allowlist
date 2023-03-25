import { Wallet } from "ethers";

export async function getSigner(mnemonic:string, path:string) {
  return Wallet.fromMnemonic(mnemonic, path)
}