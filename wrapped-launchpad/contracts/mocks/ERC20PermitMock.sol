// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20PermitMock is ERC20Permit {
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
