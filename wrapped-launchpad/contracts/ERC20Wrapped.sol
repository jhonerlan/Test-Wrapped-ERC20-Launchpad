// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWrapperFactory {
    function feeReceiver() external view returns (address);
}

contract ERC20Wrapped is Initializable, ERC20Upgradeable, ReentrancyGuardUpgradeable {
    address public factory;
    address public underlying;
    uint256 public feeBasisPoints;  

    event Deposited(address indexed user, uint256 amount, uint256 fee);
    event Withdrawn(address indexed user, uint256 amount);

    function initialize(address _underlying, address _factory, uint256 _feeBasisPoints) external initializer {
        require(_underlying != address(0), "Invalid underlying");
        require(_factory != address(0), "Invalid factory");
        require(_feeBasisPoints <= 1000, "Fee too high");

        factory = _factory;
        underlying = _underlying;
        feeBasisPoints = _feeBasisPoints;

        __ERC20_init(
            string(abi.encodePacked("Wrapped ", ERC20Upgradeable(_underlying).name())),
            string(abi.encodePacked("w", ERC20Upgradeable(_underlying).symbol()))
        );
        __ReentrancyGuard_init();
    }

    function deposit(uint256 amount) public nonReentrant {
        require(amount > 0, "Zero amount");

        uint256 fee = (amount * feeBasisPoints) / 10000;
        uint256 net = amount - fee;

        require(IERC20(underlying).transferFrom(msg.sender, address(this), amount), "Transfer fail");
        if (fee > 0) {
            require(IERC20(underlying).transfer(IWrapperFactory(factory).feeReceiver(), fee), "Fee fail");
        }

        _mint(msg.sender, net);
        emit Deposited(msg.sender, net, fee);
    }

    function depositWithPermit(
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        IERC20Permit(underlying).permit(msg.sender, address(this), amount, deadline, v, r, s);
        deposit(amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero withdraw");
        _burn(msg.sender, amount);
        require(IERC20(underlying).transfer(msg.sender, amount), "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getUnderlying() external view returns (address) {
        return underlying;
    }

    function getFeeInfo() external view returns (uint256 feeBps, address receiver) {
        feeBps = feeBasisPoints;
        receiver = IWrapperFactory(factory).feeReceiver();
    }
}
