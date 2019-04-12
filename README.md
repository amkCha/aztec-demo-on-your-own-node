# pantheon-aztec-quickstart

## dependencies

You need to install `node`, `yarn` and `docker`. 

## getting started

Please read: 
- [our blog post for more context](https://pegasys.tech)
- AZTEC whitepaper 
- AZTEC specification
- our [cheat sheet](AZTEC cheat sheet.pdf)

### run pantheon (dev mode)

We're going to run a single-node blockchain with mining enabled. More info [here](https://docs.pantheon.pegasys.tech/en/stable/Getting-Started/Run-Docker-Image/).
```bash
docker pull pegasyseng/pantheon:latest
docker run -p 8545:8545  pegasyseng/pantheon:latest --miner-enabled --miner-coinbase fe3b557e8fb62b89f4916b721be55ceb828dbd73 --rpc-http-cors-origins="all"  --rpc-http-enabled --network=dev
```

### run our aztec demo

```bash
git clone git@github.com:pegasyseng/pantheon-aztec-quickstart.git
cd pantheon-aztec-quickstart
yarn install
```
```bash
yarn run zkasset-erc20
```
```bash
yarn run zkasset
```


## misc

### regenerate contracts/artifacts

The artifacts located in contracts/artifacts are produced by AZTEC/packages/protocol scripts.
To re-generate them, run:
```bash
git clone git@github.com:AztecProtocol/AZTEC.git
cd AZTEC/packages/protocol
yarn install
yarn run compile
yarn run build:artifacts
```
Outputs the JSON artifacts for the contracts in `AZTEC/packages/contract-artifacts/artifacts/`


## License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details