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

// -------------------------------------------------------------------------------------------------
// imports
const pantheon  =  require("../pantheon.js");
const aztec     =  require("../aztec-contracts.js");
const lineBreak = "________________________________________________________________________\n";

/*
	This example:
	1. Connect to Pantheon blockchain
	2. Deploy AZTEC contracts
	3. Mint a confidential asset with an initial supply
	4. Executes a confidential joinSplit transaction

	Please note there is no account management (only 1 ethereum account is used to sign all the tx)

*/

async function main() {
	// get web3 Ethereum accounts and setup default transaction options
	let accounts  = await pantheon.getAccounts();
	let txOptions = {from: accounts[0], gasLimit: "0x47B760", gasPrice: "0x12A05F200"};

	// deploy AZTEC contracts (CryptoEngine, proof validators and ZkAssetMintable)
  
  let instances;
  
  try {
    instances = await aztec.instantiate(pantheon, txOptions);
  } catch (e) {
    console.log(e)
  }

	// ---------------------------------------------------------------------------------------------
	// generate random AZTEC accounts for alice and bob
	// note: while these accounts live on the same curve than Ethereum addresses, they can be distinct
	// from Ethereum accounts. Though in practice, the AZTEC transaction (manipulating notes owned
	// by alice and bob) would need to be signed by a valid Ethereum account (presumably owned by
  // alice or bob)
  
	const alice = aztec.secp256k1.generateAccount();
	const bob   = aztec.secp256k1.generateAccount();
	console.log("creating identities:")
	console.log(JSON.stringify({name: "alice", address: alice.address}, null, 2));
	console.log(JSON.stringify({name: "bob", address: bob.address}, null, 2));
	console.log(lineBreak);

	// ---------------------------------------------------------------------------------------------
  // Minting inital supply of confidental asset
  
	// console.log("minting asset (2 notes for alice, value 100 and 50)");
	// const aliceNotes = [
	// 	aztec.note.create(alice.publicKey, 100),
	// 	aztec.note.create(alice.publicKey, 50),
	// ];
	// await aztec.mintConfidentialAsset(aliceNotes, instances.zkAssetMintable, txOptions);

	// ---------------------------------------------------------------------------------------------
  // Confidential transfer of the asset	
  
	// console.log("confidential transfer: alice creates 2 notes of value 75 for bob (destroys her notes)");
	// const bobNotes = [
	// 	aztec.note.create(bob.publicKey, 75),
	// 	aztec.note.create(bob.publicKey, 75),
	// ];
	// await aztec.confidentialTransfer(aliceNotes, [alice, alice], 
	// 								bobNotes, 
	// 								instances.zkAssetMintable, instances.joinSplit, accounts[0], txOptions);
	// process.exit(0);
} 

main();