const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledVote = require('../ethereum/build/Vote.json');

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
});
