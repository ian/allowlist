# Allowlist.dev SDK + Contracts

The easiest and most-flexible library for adding Allowlists to Solidity smart  contracts.

For a complete guide on installation and usage, visit [https://allowlist.dev](https://allowlist.dev).

# Quickstart

## 1. Add the Allowlist packages.

```sh
npm add @allowlist/dev
```

## 2. Generate your allowlist.json

```sh
allowlist gen winners.csv 
? Enter your BIP39 mnemonic seed phrase: ...
```

This will generate an `allowlist.json` file in the current directory, and tell you which signer addresses to use:

```sh
Generated the following allowlist groups:

Group:   0x12345...
Wallets: 1234

Group:   0x23456...
Wallets: 2345
```

Note - if you need to generate a BIP39 mnemonic, use: 
```
allowlist bip39
```

## 3. Update your Smart Contract

Add the mint groups to your contract, and use the allowlist helpers for your mint function:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@allowlist/dev/contracts/AllowList.sol";
import "erc721a/contracts/ERC721A.sol";

contract MyNFT is ERC721A, AllowList {
    constructor() ERC721A("https://allowlist.dev Test Contract", "TEST") {
        _addAllowList(
            address(0x12345...), // group address
            ether(0.1),          // the mint price
            0,                   // start timestamp
            0,                   // end timestamp
            1                    // max per wallet
        );
    }

    function allowListMint(
        address _address,
        uint256 _count,
        bytes calldata _signature,
        uint256 _nonce
    ) 
      external 
      payable 
      useSignature(_address, _count, _signature, _nonce) 
    {
        _mint(_address, _count);
    }
}
```

## 4. Mint from your Frontend

Call the mint function from your frontend of choice.

Example with React + [`wagmi`](https://wagmi.sh):

```tsx
import { useAccount, useContract } from 'wagmi'
import { useSignature } from "@allowlist/dev"

const signatures = require("path/to/allowlist.json")
 
function MyComponent() {
  const contract = useContract({
    address: '0x...',
    abi: [ /* ... your abi ... */ ] 
  })
  const { address } = useAccount()
  const sig = useSignature(address)
  
  const handleMint = () => {
    if (!sig) return
    const amountToMint = 1 // or mint the full allotment of sig.n
    contract
      .allowListMint(address, amountToMint, sig.s, sig.n)
      .then((tx) => tx.wait())
      .then((receipt) => {
        console.log("Mint Successful, tx: ", receipt.transactionHash)
      })
      .catch((err) => {
        console.error("Mint Failed", err)
      })
  }

  return <>
    <button onClick={handleMint}>Mint</button>
  </>
}
```