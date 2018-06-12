var OurContract2 = artifacts.require("OurContractForTest");

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
    var user1 = accounts[2];
    var user2 = accounts[3];
    var user3 = accounts[4];
    
    it("Add Issuers and issue tokens", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.addIssuer(issuer);
        }).then(function(r)
        {
            return instance.issue(user1, 100, 1, "20 USD, tx:09331244", {from: issuer});
        }).then(function(r)
        {
            return instance.issue(user2, 200, 1, "40 USD, tx:09331244", {from: issuer});
        }).then(function(r)
        {
            return instance.issue(user3, 300, 1, "60 USD, tx:09331244", {from: issuer});
        }).then(function(r)
        {
            return instance.balanceOf.call(user1);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 100, "Balance user wrong");
            return instance.balanceOf.call(user2);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 200, "Balance user wrong");
            return instance.balanceOf.call(user3);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 300, "Balance user wrong");
            return instance.balanceOf.call(owner);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 1000000000000000000000000000 - 600, "Balance owner wrong");
            return instance.SetICOTime(1521198000, 1521208800, 1521212400);
        }).then(function(r)
        {
            return instance.IsTransferEnable.call();
        }).then(function(r)
        {
            assert.equal(r, true);
        });
    });
    
    it("Transfer between users", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.transfer(user2, 10, {from: user1});
        }).then(function(r)
        {
            assert.event(r, "Transfer", { "from": user1, "to": user2, "value": 10}, "Not transferred"); 
            return instance.balanceOf.call(user1);
        }).then(function(balance)
        {
            assert.equal(balance, 90, "wrong balance");
            return instance.balanceOf.call(user2);
        }).then(function(balance)
        {
            assert.equal(balance, 210, "wrong balance");
        });
    });
    
    it("Approve between users", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.approve(user3, 20, {from: user1} );
        }).then(function(r)
        {
            assert.event(r, "Approval", {"owner": user1, "spender": user3, "value": 20}, "Not approved");
            return instance.allowance.call(user1, user3);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 20, "approve not work");
        });
    });
    
    it("Transferr from other user", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.transferFrom(user1, user2, 10, {from: user3});
        }).then(function(r)
        {
            assert.event(r, "Transfer", {"from" : user1, "to": user2, "value" : 10});
            return instance.balanceOf.call(user1);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 80, "wrong balance user1");
            return instance.balanceOf.call(user2);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 220, "wrong balance user2");
            return instance.allowance.call(user1, user3);
        }).then(function(balance)
        {
            assert.equal(balance.valueOf(), 10, "approve not ritgh");
        });
    });
    
    it("Try transfer more money", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.transfer(user2, 100, {from: user1});
        }).then(function(r)
        {
            assert.fail("expect revert");
        }, function(revert)
        {
        });
    });
    
    it("Try transfer from without approval", function()
    {
        var instance;
        return OurContract2.deployed().then(function(i)
        {
            instance = i;
            return instance.transferFrom(user2, user1, 10, {from: user3});
        }).then(function(r)
        {
            assert.fail("expect revert");
        }, function(revert)
        {
        });
    });
    
});