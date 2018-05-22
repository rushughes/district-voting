const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledVote = require('../ethereum/build/Vote.json');

const timeTravel = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [time], // 86400 is num seconds in day
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

const mineBlock = function (time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine",
      params: [],
      id: new Date().getTime()
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
}

beforeEach (async () => {
  accounts = await web3.eth.getAccounts();

  vote = await new web3.eth.Contract(JSON.parse(compiledVote.interface))
    .deploy( { data: compiledVote.bytecode })
    .send ( { from: accounts[0], gas: '1000000' });

});

describe('Vote', () => {
  it('deploys a vote contract', () => {
    assert.ok(vote.options.address);
  });

  it('marks caller as the contract manager', async () => {
    const manager = await vote.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('contributors can be registered', async () => {
    await vote.methods.registerContributor(accounts[0], '100').send({
      from: accounts[0],
      gas: '1000000'
    });
    const request = await vote.methods.ballots(0).call();
    assert.equal(accounts[0], request.contributor);
    assert.equal('100', request.land);
  });

  it('only the manager can start the vote', async () => {
    try {
      await vote.methods.startVote().send({
        from: accounts[1],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });
  });

  it('contributors can not be registered if the contract is started', async () => {
    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });
    try {
      await vote.methods.registerContributor(accounts[0], '100').send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('contributors can not vote if the contract has not been started', async () => {
    await vote.methods.registerContributor(accounts[0], '100').send({
      from: accounts[0],
      gas: '1000000'
    });
    try {
      await vote.methods.registerVote('true').send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('contributors can vote when the contract is started', async () => {
    await vote.methods.registerContributor(accounts[0], '100').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerVote('true').send({
      from: accounts[0],
      gas: '1000000'
    });

    const request = await vote.methods.ballots(0).call();
    assert.equal(accounts[0], request.contributor);
    assert.equal('100', request.land);

    const summary = await vote.methods.getSummary().call();
    assert.equal(true, summary[0]); //started
    assert.equal(false, summary[2]); // ended
    assert.equal(1, summary[3]); // voterCount
    assert.equal(100, summary[4]); // landCount
    assert.equal(1, summary[5]); // forVoteCount
    assert.equal(0, summary[6]); // againstVoteCount
    assert.equal(100, summary[7]); // forLandCount
    assert.equal(0, summary[8]); // againstLandCount
    assert.equal(1, summary[9]); // totalVoters
    assert.equal(100, summary[10]); // totalLand
  });

  it('only registered contributors can vote', async () => {
    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });

    try {
      await vote.methods.registerVote('true').send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('after 14 days you can not vote', async () => {
    await vote.methods.registerContributor(accounts[0], '100').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });

    let timeBump = 1209600+1;
    await timeTravel(timeBump);
    await mineBlock();

    try {
      await vote.methods.registerVote('true').send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }

    const summary = await vote.methods.getSummary().call();
    assert.equal(true, summary[0]); //started
    assert.equal(true, summary[2]); // ended
    assert.equal(0, summary[3]); // voterCount
    assert.equal(0, summary[4]); // landCount
    assert.equal(0, summary[5]); // forVoteCount
    assert.equal(0, summary[6]); // againstVoteCount
    assert.equal(0, summary[7]); // forLandCount
    assert.equal(0, summary[8]); // againstLandCount
    assert.equal(1, summary[9]); // totalVoters
    assert.equal(100, summary[10]); // totalLand
  });

  it('contributors can only vote once', async () => {
    await vote.methods.registerContributor(accounts[0], '100').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerVote('true').send({
      from: accounts[0],
      gas: '1000000'
    });

    try {
      await vote.methods.registerVote('true').send({
        from: accounts[0],
        gas: '1000000'
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('end to end vote test', async () => {
    await vote.methods.registerContributor(accounts[0], '1').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerContributor(accounts[1], '2').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerContributor(accounts[2], '4').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerContributor(accounts[3], '8').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerContributor(accounts[4], '16').send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.startVote().send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerVote(true).send({
      from: accounts[0],
      gas: '1000000'
    });

    await vote.methods.registerVote(false).send({
      from: accounts[1],
      gas: '1000000'
    });

    await vote.methods.registerVote(true).send({
      from: accounts[2],
      gas: '1000000'
    });

    await vote.methods.registerVote(false).send({
      from: accounts[3],
      gas: '1000000'
    });

    await vote.methods.registerVote(true).send({
      from: accounts[4],
      gas: '1000000'
    });

    let timeBump = 1209600+1;
    await timeTravel(timeBump);
    await mineBlock();

    await vote.methods.endVoteCheck().send({
      from: accounts[0],
      gas: '1000000'
    });

    const summary = await vote.methods.getSummary().call();
    assert.equal(true, summary[0]); //started
    assert.equal(true, summary[2]); // ended
    assert.equal(5, summary[3]); // voterCount
    assert.equal(31, summary[4]); // landCount
    assert.equal(3, summary[5]); // forVoteCount
    assert.equal(2, summary[6]); // againstVoteCount
    assert.equal(21, summary[7]); // forLandCount
    assert.equal(10, summary[8]); // againstLandCount
    assert.equal(5, summary[9]); // totalVoters
    assert.equal(31, summary[10]); // totalLand
  });

});
