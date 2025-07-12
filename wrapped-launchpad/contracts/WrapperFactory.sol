// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./ERC20Wrapped.sol";

contract WrapperFactory is Initializable, AccessControlUpgradeable {
    using Clones for address;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");

    address public feeReceiver;
    uint256 public feeBasisPoints;
    address public implementation;

    mapping(address => address) public wrappedTokens;
    address[] public wrappedList;

    event WrappedCreated(address indexed token, address wrappedToken);
    event FeeReceiverChanged(address indexed newReceiver);
    event FeeChanged(uint256 newFee);

    function initialize(address _feeReceiver, uint256 _feeBps, address _implementation) external initializer {
        __AccessControl_init();

        require(_feeReceiver != address(0), "Invalid feeReceiver");
        require(_implementation != address(0), "Invalid impl");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);

        feeReceiver = _feeReceiver;
        feeBasisPoints = _feeBps;
        implementation = _implementation;
    }

    function addOperator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, account);
    }

    function removeOperator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(OPERATOR_ROLE, account);
    }

    function addTreasurer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(TREASURER_ROLE, account);
    }

    function removeTreasurer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(TREASURER_ROLE, account);
    }

    function setFeeReceiver(address _receiver) external onlyRole(TREASURER_ROLE) {
        require(_receiver != address(0), "Invalid address");
        feeReceiver = _receiver;
        emit FeeReceiverChanged(_receiver);
    }

    function setFeeBasisPoints(uint256 _bps) external onlyRole(OPERATOR_ROLE) {
        require(_bps <= 1000, "Fee too high"); // max 10%
        feeBasisPoints = _bps;
        emit FeeChanged(_bps);
    }

    function deployWrapped(address token) external returns (address) {
        require(token != address(0), "Invalid token");
        require(wrappedTokens[token] == address(0), "Already wrapped");

        address clone = implementation.clone();

        // Pasamos feeBasisPoints al initialize del wrapped
        ERC20Wrapped(clone).initialize(token, address(this), feeBasisPoints);

        wrappedTokens[token] = clone;
        wrappedList.push(token);

        emit WrappedCreated(token, clone);
        return clone;
    }

    function getWrapped(address token) external view returns (address) {
        return wrappedTokens[token];
    }

    function isWrapped(address token) external view returns (bool) {
        return wrappedTokens[token] != address(0);
    }

    function getAllWrapped() external view returns (address[] memory tokens, address[] memory wrapped) {
        uint len = wrappedList.length;
        tokens = new address[](len);
        wrapped = new address[](len);

        for (uint i = 0; i < len; i++) {
            tokens[i] = wrappedList[i];
            wrapped[i] = wrappedTokens[wrappedList[i]];
        }
    }
}
