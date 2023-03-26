// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "forge-std/Test.sol";

import "erc721a/contracts/ERC721A.sol";

import "../../contracts/AllowList.sol";

contract AllowListTest is Test {
    AllowListMock public mock;

    address private signer = 0x74049685c0227b5943926f2F742a4bc2Cf3198D6;
    address private minter = 0xc4822807d3a45905B13865376C08b9DC3D9439E8;
    bytes private signature =
        hex"7382456e4433452e8320987acdb91678772fa864fb51525c4ea261d3fc729ea913b4884c08abec424c227bca8ecbe7318cc4041f5f03264830f09022e6cc9ce41b";
    uint256 nonce = 1;

    function setUp() public {
        vm.deal(minter, 10 ether);

        // AllowList.ListConfig[] memory lists = new AllowList.ListConfig[](1);

        skip(60);

        mock = new AllowListMock(
            AllowList.ListConfig({
                signer: signer,
                mintPrice: 1 ether,
                startTime: 60,
                endTime: 100,
                maxPerWallet: 1
            })
        );
    }

    function testConstructor() public {
        assertEq(mock.listExists(address(0x0)), false);
        assertEq(mock.listExists(signer), true);
    }

    function testMint() public {
        assertEq(mock.allowListTotal(signer), 0);

        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);

        mock.mint{value: 1 ether}(minter, 1, signature, nonce);
        assertEq(mock.allowListTotal(signer), 1);
    }

    function testAddAllowList() public {
        address _signer = 0x9999999999999999999999999999999999999999;
        assertEq(mock.listExists(_signer), false);
        mock.addAllowList(
            AllowList.ListConfig({
                signer: _signer,
                mintPrice: 0,
                startTime: 0,
                endTime: 0,
                maxPerWallet: 0
            })
        );

        assertEq(mock.listExists(_signer), true);
    }

    function testRemoveAllowList() public {
        assertEq(mock.listExists(signer), true);
        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);

        mock.removeAllowList(signer);

        assertEq(mock.listExists(signer), false);
        assertEq(mock.isValidSignature(minter, signature, nonce, 1), false);
    }

    function testWrongMinterAddress() public {
        address fake_addy = address(0x1234567890123456789012345678901234567890);

        vm.prank(fake_addy);
        assertEq(mock.isValidSignature(fake_addy, signature, nonce, 1), false);
    }

    function testWrongSignature() public {
        bytes
            memory fake_sig = hex"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

        assertEq(mock.isValidSignature(minter, fake_sig, nonce, 1), false);
    }

    function testMultipleSignatureUse() public {
        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);

        mock.mint{value: 1 ether}(minter, 1, signature, nonce);

        vm.prank(minter);
        assertEq(mock.isValidSignature(minter, signature, nonce, 1), false);
    }

    function testMaxPerWallet() public {
        // Randomly generated via `yarn testdata`
        address _signer = 0x27Be5341D40734E38358012aF8cfF959b8692a37;
        address _minter = 0x9f8b9509A5Cc8C30bE0E342Dc04E90254a0cf71C;
        bytes
            memory _sig = hex"83e50971b80ea024dd7b8f509f60fdc660438dd5b96126bdcbe0ef7f1a464f7d0f6265f57855d0d19e0a6d139c350b4f2811f9c6071bfa4373765ab7f765ceef1c";
        uint256 _n = 2;

        mock.addAllowList(
            AllowList.ListConfig({
                signer: _signer,
                mintPrice: 1 ether,
                startTime: 0,
                endTime: 0,
                maxPerWallet: 2
            })
        );

        assertEq(mock.isValidSignature(_minter, _sig, _n, 3), false);
        assertEq(mock.isValidSignature(_minter, _sig, _n, 2), true);
        assertEq(mock.isValidSignature(_minter, _sig, _n, 1), true);
    }

    function testMaxPerWalletUnlimited() public {
        address signer = 0x6c61e3E294237f02845dF0e94885f03e4dee671B;
        address minter = 0xF5ba38c54e01e6688b80d43385114Db82644c3D7;
        bytes
            memory sig = hex"e390cdefb6a5e09a6999f5ea83c15ab28bc8dc83dc1ff39a9585c275df2d86117bd06062f5d348c01ba832e556d3005783b1cd3d5a1cc1e5c65ddb47fcb04f371c";
        uint256 nonce = 0;

        // Test 0 = unlimited
        mock.addAllowList(
            AllowList.ListConfig({
                signer: signer,
                mintPrice: 1 ether,
                startTime: 60,
                endTime: 100,
                maxPerWallet: 0
            })
        );

        (bool success, string memory reason) = mock.validateSignature(
            minter,
            100,
            0,
            sig,
            nonce
        );

        assertEq(
            // Generated minter with 0 nonce signature
            mock.isValidSignature(minter, sig, nonce, 100),
            true
        );
    }

    function testStartTime() public {
        rewind(60);

        assertEq(mock.isValidSignature(minter, signature, nonce, 1), false);

        skip(60);

        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);
    }

    function testEndTime() public {
        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);

        skip(40);

        assertEq(mock.isValidSignature(minter, signature, nonce, 1), false);

        mock.addAllowList(
            AllowList.ListConfig({
                signer: signer,
                mintPrice: 1 ether,
                startTime: 60,
                endTime: 0,
                maxPerWallet: 1
            })
        );

        assertEq(mock.isValidSignature(minter, signature, nonce, 1), true);
    }

    function testPayment() public {
        vm.expectRevert("Insufficient Payment");
        mock.mint{value: 0.2 ether}(minter, 1, signature, nonce);
        assertEq(mock.allowListTotal(signer), 0);

        mock.mint{value: 1 ether}(minter, 1, signature, nonce);
        assertEq(mock.allowListTotal(signer), 1);
    }
}

contract AllowListMock is ERC721A, AllowList {
    constructor(AllowList.ListConfig memory list) ERC721A("Test", "TEST") {
        _addAllowList(
            list.signer,
            list.mintPrice,
            list.startTime,
            list.endTime,
            list.maxPerWallet
        );
    }

    function balanceOf(address _owner) public view override(ERC721A, AllowList) returns (uint256) {
        return ERC721A.balanceOf(_owner);
    }

    function isValidSignature(
        address to,
        bytes calldata signature,
        uint256 nonce,
        uint256 count
    ) external view returns (bool) {
        (bool canMint, ) = _validateSignature(to, count, 0, signature, nonce);
        return canMint;
    }

    function validateSignature(
        address _address,
        uint256 _count,
        uint256 _minted,
        bytes calldata _signature,
        uint256 _nonce
    ) external view returns (bool, string memory) {
        return
            _validateSignature(_address, _count, _minted, _signature, _nonce);
    }

    function mint(
        address to,
        uint256 count,
        bytes calldata signature,
        uint256 nonce
    ) external payable useSignature(to, count, signature, nonce) {
        _mint(to, count);   
    }

    function addAllowList(AllowList.ListConfig memory _list) external {
        _addAllowList(
            _list.signer,
            _list.mintPrice,
            _list.startTime,
            _list.endTime,
            _list.maxPerWallet
        );
    }

    function removeAllowList(address signer) external {
        _removeAllowList(signer);
    }

    function listExists(address signer) external view returns (bool) {
        return allowLists[signer].exists;
    }
}
