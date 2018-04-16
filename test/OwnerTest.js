var OurContract = artifacts.require("OurContract");

function equal_event_args(one, second)
{
    if (one.length != second.length) return false;
    for (var key in one)
    {
        if (!second.hasOwnProperty(key)) return false;
        if (second[key] != one[key]) return false;
    }
    return true;
};

function has_event(logs, name, args)
{
    var finded = false;
    for (var i = 0; i < logs.logs.length; i++)
    {
        var name_ = logs.logs[i].event;
        var args_ = logs.logs[i].args;
        if (name == name_ && equal_event_args(args, args_)) return true;
    }
    return false;
};

assert.event = function(logs, name, args, text)
{
    if (!has_event(logs, name, args)) assert.fail(text);
};

assert.nevent = function(logs, name, args, text)
{
    if (has_event(logs, name, args)) assert.fail(text);
};

contract('OurContract', function(accounts)
{
    var owner = accounts[0];
    var issuer = accounts[1];
    var not_owner = accounts[2];
    
    it("Owner balance on create", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.balanceOf.call(owner);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 1000000000000000000000000000, "Balance wrong");
        });
    });
    
    it("Balance of not owner", function()
    {
        var deployed = OurContract.deployed();
        
        accounts.forEach(function(account)
        {
            deployed.then(function(instance)
            {
                return instance.balanceOf.call(account);
            }).then(function(result)
            {
                if (account == owner) assert.equal(result.valueOf(), 1000000000000000000000000000, "Owner balance wrong");
                else assert.equal(result.valueOf(), 0, "Not owner balance wrong");
            });
        });
        return deployed;
    });
    
    it("Not owner try add issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, false, "Is already issuer");
            return instance.addIssuer(issuer, {from: not_owner});
        }).then(function(r)
        {
            assert.fail("Add issuer not reverted");
        },function(reverted)
        {
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, false, "Is issuer setted");
        });
    });
    
    it("Owner add issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, false, "Is already issuer");
            return instance.addIssuer(issuer);
        }).then(function(r)
        {
            assert.event(r, "IssuerAdd", { "who" : issuer }, "Event not added");
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, true, "Is issuer not setted");
        });
    });
    
    it("Not owner try remove issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, true, "Is not issuer");
            return instance.removeIssuer(issuer, {from: not_owner});
        }).then(function(r)
        {
            assert.fail("remove issuer not reverted");
        }, function(revert)
        {
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, true, "Is issuer removed");
        });
    });
    
    it("Owner remove issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, true, "Is not issuer");
            return instance.removeIssuer(issuer);
        }).then(function(r)
        {
            assert.event(r, "IssuerRemoved", { "who" : issuer }, "Event not added");
            return instance.IsIssuer.call(issuer);
        }).then(function(r)
        {
            assert.equal(r, false, "Is issuer not removed");
        });
    });
    
    it("Owner try approve to spend", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.approve(issuer, 1000);
        }).then(function(r)
        {
            assert.fail("Owner is approve his token");
        }, function(revert)
        {
            return instance.allowance.call(owner, issuer);
        }).then(function(r)
        {
            assert.equal(r.valueOf(), 0, "owner approved tokens");
        });
        
    });
    
    it("Owner try transfer token", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.transfer(issuer, 1000);
        }).then(function(r)
        {
            assert.fail("Owner transfered token");
        }, function(revert)
        {
            return instance.balanceOf.call(issuer);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 0, "transfer to has balance");
        });
    });
    
    it("Onwer try stay issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.addIssuer(owner);
        }).then(function(r)
        {
            assert.fail("Owner set himself issuer");
        }, function(revert)
        {
            return instance.IsIssuer(owner);
        }).then(function(r)
        {
            assert.equal(r, false, "Owner is issuer");
        });
    });
    
    it("End ICO", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.balanceOf.call(owner);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 1000000000000000000000000000, "Balance wrong");
            return instance.endICO();
        }).then(function(r)
        {
            return instance.balanceOf.call(owner);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 0, "Balance after close ICO wrong");
            return instance.endICO();
        }).then(function(r)
        {
            assert.fail("double endICO not reverted");
        }, function(revert)
        {
        });
    });
    
});