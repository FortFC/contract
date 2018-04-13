var OurContract = artifacts.require("OurContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(OurContract, "name", "sym", {from: accounts[0]});
};
