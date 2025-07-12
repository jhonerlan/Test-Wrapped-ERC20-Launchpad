const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Wrapped Launchpad", function () {
  let deployer, user, operator, treasurer;
  let MockERC20, mockToken;
  let ERC20Wrapped, implementation;
  let WrapperFactory, factory;
  let wrappedAddress, wrapped;

  beforeEach(async function () {
    [deployer, user, operator, treasurer] = await ethers.getSigners();

    // Deploy mock token
    MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Test Token", "TT", ethers.parseEther("10000"));
    await mockToken.waitForDeployment();

    // Deploy ERC20Wrapped implementation
    ERC20Wrapped = await ethers.getContractFactory("ERC20Wrapped");
    implementation = await ERC20Wrapped.deploy();
    await implementation.waitForDeployment();

    // Deploy factory as proxy
    WrapperFactory = await ethers.getContractFactory("WrapperFactory");
    factory = await upgrades.deployProxy(
      WrapperFactory,
      [treasurer.address, 100, await implementation.getAddress()],
      { initializer: "initialize" }
    );
    await factory.waitForDeployment();
  });

  it("should deploy a wrapped token for a mock ERC20", async function () {
    const tx = await factory.connect(operator).deployWrapped(await mockToken.getAddress());
    await tx.wait();

    wrappedAddress = await factory.wrappedTokens(await mockToken.getAddress());
    expect(wrappedAddress).to.not.equal(ethers.ZeroAddress);

    wrapped = await ethers.getContractAt("ERC20Wrapped", wrappedAddress);
    expect(await wrapped.underlying()).to.equal(await mockToken.getAddress());
    expect(await wrapped.factory()).to.equal(await factory.getAddress());
  });

  it("should allow deposit and mint wrapped tokens", async function () {
    await factory.connect(operator).deployWrapped(await mockToken.getAddress());
    wrappedAddress = await factory.wrappedTokens(await mockToken.getAddress());
    wrapped = await ethers.getContractAt("ERC20Wrapped", wrappedAddress);

    // Transfer tokens to user and approve
    await mockToken.transfer(user.address, ethers.parseEther("1000"));
    await mockToken.connect(user).approve(wrappedAddress, ethers.parseEther("1000"));

    // Deposit into wrapped
    await wrapped.connect(user).deposit(ethers.parseEther("1000"));

    const fee = ethers.parseEther("10"); // 1%
    const received = ethers.parseEther("990");

    expect(await wrapped.balanceOf(user.address)).to.equal(received);
    expect(await mockToken.balanceOf(wrappedAddress)).to.equal(received);
    expect(await mockToken.balanceOf(treasurer.address)).to.equal(fee);
  });

  it("should allow withdrawal of the underlying token", async function () {
    await factory.connect(operator).deployWrapped(await mockToken.getAddress());
    wrappedAddress = await factory.wrappedTokens(await mockToken.getAddress());
    wrapped = await ethers.getContractAt("ERC20Wrapped", wrappedAddress);

    await mockToken.transfer(user.address, ethers.parseEther("1000"));
    await mockToken.connect(user).approve(wrappedAddress, ethers.parseEther("1000"));
    await wrapped.connect(user).deposit(ethers.parseEther("1000"));

    const balanceBefore = await mockToken.balanceOf(user.address);
    await wrapped.connect(user).withdraw(ethers.parseEther("990"));
    const balanceAfter = await mockToken.balanceOf(user.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
    expect(await wrapped.balanceOf(user.address)).to.equal(0);
  });

  it("should prevent duplicate wrapped token deployment", async function () {
    await factory.connect(operator).deployWrapped(await mockToken.getAddress());
    await expect(
      factory.connect(operator).deployWrapped(await mockToken.getAddress())
    ).to.be.revertedWith("Already wrapped");
  });
});
