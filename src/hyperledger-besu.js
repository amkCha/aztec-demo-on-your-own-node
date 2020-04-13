// Copyright 2018 ConsenSys AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const HDWalletProvider = require("@truffle/hdwallet-provider");
const contract         = require("truffle-contract");
const Web3             = require("web3");
const path             = require("path");


// WARNING: these private keys are defined in dev genesis file of HyperLedger Besu private test network 
// DEMO PURPOSES ONLY, do not use in production
const nodeURL = "http://localhost:8545";
const privateKey  = "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3";

// Uncomment variables below if you want to use Ganache for this demo
// const nodeURL = "http://localhost:7545";
// const privateKey = "40718bdd653bbbd6c8b51013862960b99f781dcf4c8b27b42706fe6565311ea4";

const provider    = new HDWalletProvider(privateKey, nodeURL);
const web3        = new Web3(provider);

// returns a truffle-contract 
async function readContract(abi) {
  let artifact = require(path.join("../contracts/artifacts/", abi));
  let toReturn = contract(artifact);
  toReturn.setProvider(provider);
  return toReturn
}

// accounts provided by the HyperLedger Besu private test network genesis file
async function getAccounts() {
	// const accounts = await web3.eth.getAccounts();
	const accounts = [
		"0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
		"0xf17f52151EbEF6C7334FAD080c5704D77216b732"
  ]
  // Uncomment here to use 2 main ganache accounts
    // const accounts = [
    //   "0x659E3140ee3495D23021D1eDA53Dc02aa6cDcBbF",
    //   "0x315345DB61189a1929750aEBaC22412Be13cc92C"
    // ]
	return accounts;
}

module.exports = {
	web3,
  	readContract,
  	getAccounts
};