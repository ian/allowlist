import { useEffect, useState } from "react"
import { utils } from "ethers"
import { SignatureWithSigner } from "../types"

const SIGNATURES = require(process.cwd() + "/allowlist.json")

export function useSignature(address: string) {
  const [sig, setSig] = useState<SignatureWithSigner>()
  
  useEffect(() => {
    const sig = getSignature(address)
    setSig(sig)
  }, [address])

  return sig
}

export function getSignature(address: string): SignatureWithSigner | null {
  if (!address) return null
  if (!SIGNATURES) return null

  const hash = utils.keccak256(utils.getAddress(address))
  return SIGNATURES[hash]
}