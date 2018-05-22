const csvdata = require('csvdata');

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const Vote = require('../ethereum/build/Vote.json');

const { mnemonic, network, voteContractAddress } = require('../config');

const provider = new HDWalletProvider(
  mnemonic,
  network
);
const web3 = new Web3(provider);

const vote = new web3.eth.Contract(
  JSON.parse(Vote.interface),
  voteContractAddress
);

const deploy = async (filename) => {
  const accounts = await web3.eth.getAccounts();

  const csv = await csvdata.load(filename);
  console.log(csv);
  for (var i = 0; i < csv.length; i++) {
    const {address, land} = csv[i];
    console.log(address, land);
    const a = address.replace(/'/g, "");
    console.log(a);
    try {
      await vote.methods.registerContributor(a, land).send({
        from: accounts[0],
        gas: '1000000'
      });
    } catch (err) {
      console.log('ERROR:', err);
    }
  }
  console.log("**** FINISHED ****")
};

const filename = process.argv[2];

deploy(filename);
