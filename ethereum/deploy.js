const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledVote = require('./build/Vote.json');
const { mnemonic, network } = require('../config');

const provider = new HDWalletProvider(
  mnemonic,
  network
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledVote.interface))
    .deploy({ data: '0x' + compiledVote.bytecode })
    .send({
      gas: '1000000',
      gasPrice: web3.utils.toWei('2', 'gwei'),
      from: accounts[0]
    });

    console.log('Contract deployed to', result.options.address);
};
deploy();
