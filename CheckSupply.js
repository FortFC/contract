var OurContract = artifacts.require("OurContract");

module.exports = function(callback) {
  OurContract.deployed().then(function(instance)
    {
      return instance.totalSupply();
    }).then(function(balance)
    {
      console.log(balance);
    }).catch(function(e)
    {
      console.log(e);
    })
}