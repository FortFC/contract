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
    var issuer2 = accounts[2];
    var not_owner = accounts[2];
    var not_issuer = accounts[3];
    var user_to = accounts[4];
    
    it("Add issuer", function()
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
    
    it("issue token", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(user_to, 100, 1, "20 USD, tx:09331244", {from: issuer});
        }).then(function(r)
        {
            assert.event(r, "Cause", {"to": user_to, "val": 100, "_type": 1, "message": "20 USD, tx:09331244"}, "Event not created");
            return instance.balanceOf.call(user_to);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 100, "Balance user wrong");
            return instance.balanceOf.call(owner);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 1000000000000000000000000000 - 100, "Balance owner wrong");
        });
    });
    
    it("try issuer from owner", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(user_to, 100, 1, "20 USD, tx:09331244", {from: owner});
        }).then(function(r)
        {
            assert.fail("Event created issue token from owner");
        }, function(revert)
        {
        });
    });
    it("try issuer from not issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(user_to, 100, 1, "20 USD, tx:09331244", {from: not_issuer});
        }).then(function(r)
        {
            assert.fail("Event created issue token from not issuer");
        }, function(revert)
        {
        });
    });
    it("try issuer issue to himself", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(issuer, 100, 1, "20 USD, tx:09331245", {from: issuer});
        }).then(function(r)
        {
            assert.fail("Event created issue token to issuer himself");
        }, function(revert)
        {
        });
    });
    it("try issuer issue token to owner", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(owner, 100, 1, "20 USD, tx:093987", {from: issuer});
        }).then(function(r)
        {
            assert.fail("Event created issue toeln to owner");
        }, function(revert)
        {
        });
    });
    
    it("Add issuer2", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.IsIssuer.call(issuer2);
        }).then(function(r)
        {
            assert.equal(r, false, "Is already issuer");
            return instance.addIssuer(issuer2);
        }).then(function(r)
        {
            assert.event(r, "IssuerAdd", { "who" : issuer2 }, "Event not added");
            return instance.IsIssuer.call(issuer2);
        }).then(function(r)
        {
            assert.equal(r, true, "Is issuer not setted");
        });
    });
    
    it("try issuer issue to other issuer", function()
    {
        var instance;
        return OurContract.deployed().then(function(i)
        {
            instance = i;
            return instance.issue(issuer2, 100, 1, "20 USD, tx:04954", {from: issuer});
        }).then(function(r)
        {
            assert.fail("Event created issue token to opter issuer");
        }, function(revert)
        {
        });
        var t = new Date();
        var u = t.getTime();
        console.log(u);
    });
});