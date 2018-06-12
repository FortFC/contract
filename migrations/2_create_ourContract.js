var OurContract = artifacts.require("OurContract");
var OurContract2 = artifacts.require("OurContractForTest");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(OurContract, "name", "sym", {from: accounts[0]});
  deployer.deploy(OurContract2, "name", "sym", {from: accounts[0]});
};
