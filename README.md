# Allowlist.dev SDK + Contracts

The easiest and most-flexible library for adding Allowlists to Solidity smart  contracts.

For a complete guide on installation and usage, visit [https://allowlist.dev](https://allowlist.dev).

## Getting started

1. Add the Allowlist packages.

```sh
npm add @allowlist/dev
```

2. Generate your allowlist.json

```sh
allowlist gen winners.csv 
```

This will generate an `allowlist.json` file in the current directory, and tell you which signer addresses to use:

```sh
Generated the following allowlist groups:

Group:   0x12345...
Wallets: 1234

Group:   0x23456...
Wallets: 2345
```

3. Add the mint groups to your contract, and add the group-based minting function:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@allowlist/dev/contracts/AllowList.sol";
import "erc721a/contracts/ERC721A.sol";

contract MyNFT is ERC721A, AllowList {
    constructor() ERC721A("https://allowlist.dev Test Contract", "TEST") {
        _addList(
            address(0x12345...), # group address
            ether(0.1),          # the mint price
            0,                   # start timestamp
            0,                   # end timestamp
            1                    # max per wallet
        );
    }


}
```