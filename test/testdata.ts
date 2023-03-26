import { Wallet, utils } from "ethers"
import { createMessage, sign } from "../src/utils/sigs"

async function run() {
  const signer = Wallet.createRandom()

  for (let i = 0; i < 5; i++) {
    const minter = Wallet.createRandom()
    const nonce = i

    const msg = createMessage(minter.address, nonce)
    const signature = await sign(signer, msg)
    const key = utils.keccak256(minter.address)

    console.log()
    console.log("Signer:    ", signer.address)
    console.log("Minter:    ", minter.address)
    console.log("Signature: ", signature)
    console.log("Nonce:     ", nonce)
    console.log()
  }

  console.log("Signer:     ", signer.address)
  console.log("Private Key:", signer.privateKey)

  // console.log("Recovered  ", Object.values(signatures)[0].recovered)
}

run()
