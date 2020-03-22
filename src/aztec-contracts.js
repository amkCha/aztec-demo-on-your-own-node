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
// AZTEC library imports
const {	constants, proofs }                  = require("@aztec/dev-utils");
const { secp256k1, note, proof, abiEncoder } = require("aztec.js");
const bn128 = require('@aztec/bn128');


const lineBreak = "________________________________________________________________________\n";

// -------------------------------------------------------------------------------------------------
// Instantiate contracts: CryptoEngine, proof systems, zkAsset[...]
async function instantiate(pantheon, txOptions) {
	var instances = {};

	console.log(lineBreak);
	console.log("deploying AZTEC contracts...")

  // get contracts schemas
  let ACE;
  let ZKASSET_MINTABLE;
  let JOINSPLIT;
  let ADJUST_SUPPLY;
  let ERC20_MINTABLE;
  let ZKASSET;
  try {
  ACE                 = await pantheon.readContract("ACE.json");
  // console.log(ACE)
	ZKASSET_MINTABLE    = await pantheon.readContract("ZkAssetMintable.json");
  // console.log(ZKASSET_MINTABLE)
	JOINSPLIT           = await pantheon.readContract("JoinSplit.json");
  // console.log(JOINSPLIT)
	ADJUST_SUPPLY       = await pantheon.readContract("AdjustSupply.json");
  // console.log(ADJUST_SUPPLY)
	ERC20_MINTABLE	  = await pantheon.readContract("ERC20Mintable.json");
  // console.log(ERC20_MINTABLE)
  ZKASSET			  = await pantheon.readContract("ZkAsset.json");
  // console.log(ZKASSET)
  } catch (e) {
    console.log(e)
  }

  // deploy crypto engine contract
  try {
  instances.ace             = await ACE.new(txOptions);
  // console.log(instances.ace);
	instances.joinSplit       = await JOINSPLIT.new(txOptions);
	instances.adjustSupply    = await ADJUST_SUPPLY.new(txOptions);
	instances.erc20			  = await ERC20_MINTABLE.new(txOptions);
	instances.zkAssetMintable = await ZKASSET_MINTABLE.new(
		instances.ace.address, 
		"0x0000000000000000000000000000000000000000", 	// ERC20 linked address (none)
		1, 												// scaling factor for ERC20 tokens
		true, 											// canMint
		false,  										// canConvert
		txOptions
	);
	instances.zkAsset         = await ZKASSET.new(
		instances.ace.address, 
		instances.erc20.address, 						// ERC20 linked address
		1, 												// scaling factor for ERC20 tokens
		false, 											// canMint
		true,  											// canConvert
		txOptions
  );
  } catch (e) {
    console.log(e)
  }

  // set CRS and proof systems addresses
  // console.log(instances.ace);
	await instances.ace.setCommonReferenceString(bn128.CRS, txOptions);
  // console.log(instances.ace.setProof);
	await instances.ace.setProof(proofs.JOIN_SPLIT_PROOF, instances.joinSplit.address, txOptions);
  // console.log(instances.ace.setProof);
	await instances.ace.setProof(proofs.MINT_PROOF, instances.adjustSupply.address, txOptions);
	
	console.log("deployed ace at:             " + instances.ace.address);
	console.log("deployed joinSplit at:       " + instances.joinSplit.address);
	console.log("deployed adjustSupply at:    " + instances.adjustSupply.address);
	console.log("deployed zkAssetMintable at: " + instances.zkAssetMintable.address);
	console.log("deployed zkAsset at:         " + instances.zkAsset.address);
	console.log("deployed erc20 at:           " + instances.erc20.address);
	console.log(lineBreak);

	return instances;
};


// -------------------------------------------------------------------------------------------------
// Mint initial supply for a zkAssetMintable
async function mintConfidentialAsset(notes, zkAssetMintable, txOptions) {
	// sum the value of notes to compute the total supply to mint
 	var totalMintedValue = 0;
	for (i = 0; i < notes.length; i++) { 
  		totalMintedValue += notes[i].k.toNumber();
	}

	// note representing new total supply
	const newTotalMinted = note.create(secp256k1.generateAccount().publicKey, totalMintedValue);
	const oldTotalMinted = note.createZeroValueNote(); // old total minted
	const adjustedNotes  = notes.map(x => x);

	// construct MINT PROOF
    var { proofData } = proof.mint.encodeMintTransaction({
        newTotalMinted, // new total minted
        oldTotalMinted, // old total minted
        adjustedNotes, 	// new notes distribution
        senderAddress: zkAssetMintable.address
    });

    // sending the transaction on the blockchain
	try {
		let receipt = await zkAssetMintable.confidentialMint(proofs.MINT_PROOF, proofData, txOptions)
		console.log("confidentialMint success. events:");
		logNoteEvents(receipt.logs);
		console.log(lineBreak);
	} catch (error) {
		console.log("confidentialMint failed: " + error);
		process.exit(-1);
	}
}

// -------------------------------------------------------------------------------------------------
// Confidential transfer. Destroy inputNotes, creates outputNotes through a joinSplit transaction
async function confidentialTransfer(inputNotes, inputNoteOwners, outputNotes, zkAssetMintable, joinSplit, publicOwner, txOptions, display=true) {
	// compute kPublic
	var kPublic = 0;
	for (i = 0; i < outputNotes.length; i++) { 
  		kPublic -= outputNotes[i].k.toNumber();
	}
	for (i = 0; i < inputNotes.length; i++) { 
  		kPublic += inputNotes[i].k.toNumber();
	}

	// construct the joinsplit proof
	var {
		proofData
	} = proof.joinSplit.encodeJoinSplitTransaction({
		inputNotes: inputNotes,
		outputNotes: outputNotes,
		senderAddress: txOptions.from,
		inputNoteOwners: inputNoteOwners,
		publicOwner: publicOwner,
		kPublic: kPublic,
		validatorAddress: joinSplit.address
	});

	// send the transaction to the blockchain
	try {
		let receipt = await zkAssetMintable.confidentialTransfer(proofData, txOptions)
		if(display==true){
			console.log("confidentialTransfer success. events:");
			logNoteEvents(receipt.logs);
			console.log(lineBreak);
		}
		
	} catch (error) {
		console.log("confidentialTransfer failed: " + error);
		process.exit(-1);
	}
}

// -------------------------------------------------------------------------------------------------
// Convert some ERC20 to zkassets
async function shieldsERC20toZkAsset(inputNotes, inputNoteOwner, outputNotes, zkAsset, ace, joinSplit, publicOwner, txOptions) {
	// compute kPublic
	var kPublic = 0;
	for (i = 0; i < outputNotes.length; i++) { 
		kPublic -= outputNotes[i].k.toNumber();
  	}
  	for (i = 0; i < inputNotes.length; i++) { 
		kPublic += inputNotes[i].k.toNumber();
  	}

  	// construct the joinsplit proof
	var proofData = proof.joinSplit.encodeJoinSplitTransaction({
		inputNotes:[], 
		outputNotes: outputNotes,
		senderAddress: txOptions.from,
		inputNoteOwners: inputNoteOwner,
		publicOwner: publicOwner,
		kPublic: kPublic,
		validatorAddress: joinSplit.address
	});
	
	const depositProofOutput = abiEncoder.outputCoder.getProofOutput(proofData.expectedOutput, 0);
	const depositProofHash   = abiEncoder.outputCoder.hashProofOutput(depositProofOutput);

	// 2. ace allows depositProofHash to sp	end erc20 tokens on behalf ethereumAccounts[0]
	await ace.publicApprove(
		zkAsset.address,
		depositProofHash,
		kPublic,
		txOptions
	)
	
	try {
		let receipt = await zkAsset.confidentialTransfer(proofData.proofData, txOptions);
	} catch (error) {
		console.log("deposit failed: " + error);
		process.exit(-1);
	}
	
}

// utility function to display Create and Destroy note event generated by ZkAsset.sol
function logNoteEvents(logs) {
	for (i = 0; i < logs.length; i++) {
		var e = logs[i];
		var toPrint = {event: e.event};
		if (e.event === "CreateNote" || e.event === "DestroyNote") {
			toPrint.owner = e.args.owner;
			toPrint.hash  = e.args.noteHash;
			console.log(JSON.stringify(toPrint, null, 2));	
		} 
	}
}

module.exports = {
	instantiate,
	mintConfidentialAsset,
	confidentialTransfer,
	shieldsERC20toZkAsset,
	secp256k1,
	note
};