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
// Imports
const pantheon  =  require("../pantheon.js");
const aztec     =  require("../aztec-contracts.js");
const lineBreak = "________________________________________________________________________\n";

/*
    This example:
    1. Connect to Pantheon blockchain
    2. Deploy AZTEC contracts
    3. Mint a public ERC20 with an initial supply
    4. Shields ERC20 token to private AZTEC notes
    4. Privately transfers AZTEC notes
    5. Unshields AZTEC notes to ERC20 tokens

*/

async function main(){
    // get web3 Ethereum accounts and setup default transaction options
    let accounts  = await pantheon.getAccounts();
	let txOptions = [
        {from: accounts[0], gasLimit: "0x47B760", gasPrice: "0x12A05F200"},
        {from: accounts[1], gasLimit: "0x47B760", gasPrice: "0x12A05F200"}
    ];

    // deploy AZTEC contracts (CryptoEngine, proof validators and ZkAssetMintable)
	let instances = await aztec.instantiate(pantheon, txOptions[0]);
    
    // ---------------------------------------------------------------------------------------------
	// generate random AZTEC accounts for alice and bob
	// note: while these accounts live on the same curve than Ethereum addresses, they can be distinct
	// from Ethereum accounts. Though in practice, the AZTEC transaction (manipulating notes owned
	// by alice and bob) would need to be signed by a valid Ethereum account (presumably owned by
	// alice or bob)
	const alice = aztec.secp256k1.generateAccount();
	const bob   = aztec.secp256k1.generateAccount();

    // ---------------------------------------------------------------------------------------------
    // Minting inital supply of confidental asset ERC20
    const erc20totalSupply = 150;
    console.log(`minting ${erc20totalSupply} erc20 tokens (initial owner: alice)`);
    await instances.erc20.mint(accounts[0], erc20totalSupply, txOptions[0]);

    // delegate erc20 token access from account[0] to AZTEC.ACE contract
    await instances.erc20.approve(
		instances.ace.address,
		erc20totalSupply,
		txOptions[0]
	);
    await logERC20balances(instances.erc20, accounts);

    // ---------------------------------------------------------------------------------------------
    // accounts[0] makes a deposit
    console.log("alice shields 150 erc20 tokens to AZTEC notes");
    const aliceNotes = [
		aztec.note.create(alice.publicKey, 100),
		aztec.note.create(alice.publicKey, 50),
	];
    await aztec.shieldsERC20toZkAsset(
        [],
        [],
        aliceNotes,
        instances.zkAsset,
        instances.ace,
        instances.joinSplit,
        accounts[0],
        txOptions[0]
    );
    await logERC20balances(instances.erc20, accounts);
    
    // ---------------------------------------------------------------------------------------------
    // confidential transfer
    console.log("alice privately transfers 150 AZTEC notes to bob");
    const bobNotes = [
        aztec.note.create(bob.publicKey, 75),
        aztec.note.create(bob.publicKey, 75),
    ];
    await aztec.confidentialTransfer(
        aliceNotes, 
        [alice, alice],
        bobNotes, 
        instances.zkAsset,
        instances.joinSplit,
        accounts[0],
        txOptions[0],
        false
    );
    await logERC20balances(instances.erc20, accounts);

    // ---------------------------------------------------------------------------------------------
    // Confidential transfer to accounts[1]
    console.log("bob unshields 100 AZTEC notes (to erc20 tokens)");
    const bobNotes_1 = [
        aztec.note.create(bob.publicKey, 25),
        aztec.note.create(bob.publicKey, 25),
    ] 
    // since we do a utxo transaction with 150 as input (bobNotes) and 50 as output (bobNotes_1)
    // we're left with a positive balance of 100 that will be unshielded to ERC20 tokens
    await aztec.confidentialTransfer(
        bobNotes, 
        [bob, bob],
        bobNotes_1, 
        instances.zkAsset,
        instances.joinSplit,
        accounts[1],
        txOptions[0],
        false
    );
    await logERC20balances(instances.erc20, accounts);

    // ---------------------------------------------------------------------------------------------
    // confidentialTransfer from bob to alice
    console.log("bob privately transfers 20 AZTEC notes and 30 erc20 tokens to alice");
    const aliceNotes_1 = [
        aztec.note.create(alice.publicKey, 20),
    ] // bobNotes_1 value is 50, output aztec notes = 20. 
    await aztec.confidentialTransfer(
        bobNotes_1, 
        [bob, bob],
        aliceNotes_1, 
        instances.zkAsset,
        instances.joinSplit,
        accounts[0],
        txOptions[0],
        false
    );
    await logERC20balances(instances.erc20, accounts);

    process.exit(0);
}

async function logERC20balances(erc20, accounts){
    const erc20totalSupply = (await erc20.totalSupply()).toNumber();
    const erc20balances    = [ 
        (await erc20.balanceOf(accounts[0])).toNumber(),
        (await erc20.balanceOf(accounts[1])).toNumber()
    ];
    const shieldedSupply = erc20totalSupply - erc20balances[0] - erc20balances[1];

    console.log(lineBreak);
    console.log("erc20 balances:\n")
    console.log("alice               " + erc20balances[0]);
    console.log("bob                 " + erc20balances[1]);
    console.log("shielded in ZkAsset " + shieldedSupply);
    console.log("total supply        " + erc20totalSupply);
    console.log(lineBreak);
}


main();