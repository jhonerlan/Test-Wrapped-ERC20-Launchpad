require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
    scripts: "./scripts"
  }
};
