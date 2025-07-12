const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Wrapped depositWithPermit", function () {
  let owner, user, feeReceiver;
  let token, wrapped, factory;
  const feeBps = 100; // 1%

  beforeEach(async function () {
    [owner, user, feeReceiver] = await ethers.getSigners();

    const TokenWithPermit = await ethers.getContractFactory("ERC20PermitMock");
    token = await TokenWithPermit.deploy("MockToken", "MTK");
    await token.waitForDeployment();

    await token.mint(user.address, ethers.parseEther("1000"));

    const Wrapped = await ethers.getContractFactory("ERC20Wrapped");
    const wrappedImpl = await Wrapped.deploy();
    await wrappedImpl.waitForDeployment();

    const Factory = await ethers.getContractFactory("WrapperFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();

    await factory.initialize(feeReceiver.address, feeBps, wrappedImpl.target);
    await factory.deployWrapped(token.target);

    const wrappedAddress = await factory.wrappedTokens(token.target);
    wrapped = await ethers.getContractAt("ERC20Wrapped", wrappedAddress);
  });

  it("should deposit tokens using depositWithPermit and charge fee", async function () {
    const amount = ethers.parseEther("100");

    const nonce = await token.nonces(user.address);
    const deadline = ethers.MaxUint256;

    const domain = {
      name: await token.name(),
      version: "1",
      chainId: (await ethers.provider.getNetwork()).chainId,
      verifyingContract: token.target,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value = {
      owner: user.address,
      spender: wrapped.target,
      value: amount,
      nonce: nonce,
      deadline: deadline,
    };

    const signature = await user.signTypedData(domain, types, value);
    const { v, r, s } = ethers.Signature.from(signature);

    const fee = amount * BigInt(feeBps) / BigInt(10000);
    const net = amount - fee;

    await expect(wrapped.connect(user).depositWithPermit(amount, deadline, v, r, s))
      .to.emit(wrapped, "Deposited")
      .withArgs(user.address, net, fee);

    expect(await wrapped.balanceOf(user.address)).to.equal(net);
    expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther("1000") - amount);
    expect(await token.balanceOf(feeReceiver.address)).to.equal(fee);
  });
});
