var OurContract = artifacts.require("OurContract");

contract('OurContract', function(accounts)
{
    it("AddIssuer", function()
    {
        var deployed = OurContract.deployed({from: accounts[1]});
        var instance;
        
        return deployed.then(function(i)
        {
            instance = i;
            console.log(instance.address);
            return instance.IsIssuer.call(accounts[1], {from: accounts[1]});
        }).then(function(result)
        {
            assert.equal(result, false, "Account 1 is already issuer");
            return instance.addIssuer(accounts[1]);
        }).then(function(result)
        {
            return instance.IsIssuer.call(accounts[1], {from: accounts[0]});
        }, function(result)
        {
            console.log("reverted");
            console.log(result);
            return instance.IsIssuer.call(accounts[1], {from: accounts[0]});
        }).then(function(result)
        {
            assert.equal(result, true, "Account 1 is not issuer");
        });
    });
    
    
    
});