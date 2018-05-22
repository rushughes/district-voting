import web3 from './web3';
import Vote from './build/Vote.json';
const { voteContractAddress } = require('../config');

const instance = new web3.eth.Contract(
  JSON.parse(Vote.interface),
  voteContractAddress
);

export default instance;
