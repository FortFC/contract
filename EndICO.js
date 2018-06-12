var OurContract = artifacts.require("OurContract");

module.exports = function(callback) {
  OurContract.deployed().then(function(instance)
    {
      return instance.endICO();
    }).then(function(result)
    {
      console.log(result);
    }).catch(function(e)
    {
      console.log(e);
    })
}