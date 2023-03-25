// Helpful ethers.js links:
// https://docs.ethers.io/v5/api/signer/#Signer-signMessage%5Bethers%5D
// https://docs.ethers.io/v5/api/utils/hashing/#utils-hashMessage

// the secret to getting this working was this post: https://blog.cabala.co/how-to-verify-off-chain-results-and-whitelist-with-ecdsa-in-solidity-using-openzeppelin-ethers-js-ba4c85521711

import { Signer, Wallet, utils } from "ethers"
import type { SignatureWithSigner } from "../types"

export async function createSignature(
  wallet: Wallet,
  address: string,
  num: number
): Promise<SignatureWithSigner> {
  const msg = createMessage(address, num)
  const s = await sign(wallet, msg)

  return {
    x: wallet.address,
    s,
    n: num
  }
}

/**
 * Pack the address and generate and nonce together and hash them
 * @param payload address
 * @returns hash
 */
export function createMessage(address: string, num: number) {
  const hash = utils.solidityKeccak256(
    ["address", "uint256"],
    [utils.getAddress(address), num]
  )

  return utils.arrayify(hash)
}

export async function sign(signer: Signer, message: Uint8Array) {
  return signer.signMessage(utils.arrayify(message))
}

export function recoverAddress(signature: string, message: Uint8Array) {
  return utils.verifyMessage(message, signature)
}