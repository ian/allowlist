import { createMessage, recoverAddress, sign } from "../../src"
import { ethers } from "ethers"
import { it, describe } from "vitest"
import * as assert from "node:assert/strict"

// import { deployContract } from "../../helpers"

describe("signatures", () => {
  it("should recover via ethers", async function () {
    const signer = ethers.Wallet.createRandom()
    const minter = ethers.Wallet.createRandom()

    const msg = createMessage(minter.address, 1)
    const signature = await sign(signer, msg)
    const verified = recoverAddress(signature, msg)

    assert.equal(verified, signer.address)
  })

  // it("should recover via contract", async function () {
  //   const signer = ethers.Wallet.createRandom()
  //   const msg = `${signer.address}`
  //   const signature = await sign(this.owner, msg)

  //   const contractRecover = await this.contract
  //     .connect(this.addr1)
  //     .check(signature)

  //   assert.equal(contractRecover, this.owner.address)
  // })
})
