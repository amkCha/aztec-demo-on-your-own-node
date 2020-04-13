# hyperledger-besu-aztec-quickstart

## dependencies

You need to install `node`, `yarn` and `docker`. 

## getting started

Interesting to read:
- AZTEC [whitepaper](https://github.com/AztecProtocol/AZTEC/blob/master/AZTEC.pdf)
- AZTEC [specification](https://github.com/AztecProtocol/specification)
- our [cheat sheet](aztec_cheatsheet.pdf)

### run HyperLedger Besu private test network

We're going to run a single-node blockchain with mining enabled.

More info [here](https://besu.hyperledger.org/en/1.3.0/Tutorials/Quickstarts/Private-Network-Quickstart/).
```console
git clone https://github.com/PegaSysEng/besu-quickstart.git
./run.sh
```

### run our aztec demo

```console
git clone git@github.com:amkCha/aztec-demo-on-your-own-node.git
cd pantheon-aztec-quickstart
yarn install
```
```console
yarn run zkasset-erc20
```
```console
yarn run zkasset
```


## misc

### regenerate contracts/artifacts

The artifacts located in contracts/artifacts are produced by AZTEC/packages/protocol scripts.
To re-generate them, run:
```console
git clone git@github.com:AztecProtocol/AZTEC.git
cd AZTEC/packages/protocol
yarn install
yarn run compile
yarn run build:artifacts
```
Outputs the JSON artifacts for the contracts in `AZTEC/packages/contract-artifacts/artifacts/`


## License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details
