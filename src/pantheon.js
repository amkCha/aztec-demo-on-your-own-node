const HDWalletProvider = require("truffle-hdwallet-provider");
const contract         = require("truffle-contract");
const Web3             = require("web3");
const path             = require("path");


// WARNING: this private key is defined in dev genesis file of Pantheon in dev mode
// (running  pantheon [...] --network=dev)
// DEMO PURPOSES ONLY, do not use in production.
const privateKey  = "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";
const pantheonURL = "http://localhost:8545";

const provider    = new HDWalletProvider(privateKey, pantheonURL);
const web3        = new Web3(provider);


// returns a truffle-contract 
async function readContract(abi) {
  let artifact = require(path.join("../contracts/artifacts/", abi));
  let toReturn = contract(artifact);
  toReturn.setProvider(provider);
  return toReturn
}

async function getAccounts() {
	const accounts = await web3.eth.getAccounts();
	return accounts;
}

module.exports = {
	web3,
  	readContract,
  	getAccounts
};