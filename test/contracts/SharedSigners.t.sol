// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "forge-std/Test.sol";

import "erc721a/contracts/ERC721A.sol";

import "../src/SharedSigners.sol";

contract SharedSignersTest is Test {
    SharedSignersMock mock;

    function setUp() public {
        mock = new SharedSignersMock();
    }

    // To generate these values, run `yarn signatures`
    address private signer = 0x74049685c0227b5943926f2F742a4bc2Cf3198D6;
    address private minter = 0xc4822807d3a45905B13865376C08b9DC3D9439E8;
    bytes private signature =
        hex"7382456e4433452e8320987acdb91678772fa864fb51525c4ea261d3fc729ea913b4884c08abec424c227bca8ecbe7318cc4041f5f03264830f09022e6cc9ce41b";
    bytes private message =
        hex"57939ec8c7ab613f669fd19a56cdcd363f8a5559c3f1521ea1379fff0c874dc3";
    uint256 private nonce = 1;

    function testRecoverSigner() public {
        vm.prank(minter);
        address recovered = mock.recoverSigner(signature, nonce);
        assertEq(recovered, signer);
    }
}

contract SharedSignersMock is SharedSigners {
    function createMessage(address _address, uint256 _nonce)
        external
        view
        returns (bytes32)
    {
        return _createMessage(_address, _nonce);
    }

    function recoverSigner(bytes memory signature, uint256 nonce)
        public
        view
        returns (address)
    {
        return _recoverSigner(signature, msg.sender, nonce);
    }
}
