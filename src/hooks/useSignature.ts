import { useEffect, useState } from "react";
import { utils } from "ethers";
import { SignatureWithSigner, SignaturesJSON } from "../types";

export function useSignature(
  address: string | undefined,
  signatures: SignaturesJSON
) {
  const [sig, setSig] = useState<SignatureWithSigner>();

  useEffect(() => {
    const sig = getSignature(address, signatures);
    setSig(sig);
  }, [address]);

  return sig;
}

export function getSignature(
  address: string,
  signatures: SignaturesJSON
): SignatureWithSigner | null {
  if (!address) return null;
  if (!signatures) return null;

  const hash = utils.keccak256(utils.getAddress(address));
  return signatures[hash];
}
