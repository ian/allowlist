// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9;

import "forge-std/Test.sol";
import "erc721a/contracts/ERC721A.sol";

import "../src/Timing.sol";

contract TimingTest is Test {
    using Timing for uint256;

    function testIsBefore() public {
        assertEq(block.timestamp, 1);
        assertEq(block.timestamp.isBefore(0), false);
        assertEq(block.timestamp.isBefore(1), false); // we use < not <=
        assertEq(block.timestamp.isBefore(2), true);
    }

    function testIsAfter() public {
        assertEq(block.timestamp, 1);
        assertEq(block.timestamp.isAfter(0), true);
        assertEq(block.timestamp.isAfter(1), true); // we use <=
        assertEq(block.timestamp.isAfter(2), false);
    }
}

// contract TimingMock is Timing {
//     function nowIsBefore(uint256 _time) external view returns (bool) {
//         return _nowIsBefore(_time);
//     }

//     function nowIsAfter(uint256 _time) external view returns (bool) {
//         return _nowIsAfter(_time);
//     }
// }
