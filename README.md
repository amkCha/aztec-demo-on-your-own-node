# pantheon-aztec-quickstart

## dependencies

You need to install `node`, `yarn` and `docker`. 

## getting started

Please [read our blog post for more context](https://pegasys.tech).

### run pantheon (dev mode)

We're going to run a single-node blockchain with mining enabled. More info [here](https://docs.pantheon.pegasys.tech/en/stable/Getting-Started/Run-Docker-Image/).
```
docker pull pegasyseng/pantheon:latest
docker run -p 8545:8545  pegasyseng/pantheon:latest --miner-enabled --miner-coinbase fe3b557e8fb62b89f4916b721be55ceb828dbd73 --rpc-http-cors-origins="all"  --rpc-http-enabled --network=dev
```

### run our aztec demo

```
git clone git@github.com:pegasyseng/pantheon-aztec-quickstart.git
cd pantheon-aztec-quickstart
yarn install
yarn run zkasset
```


## misc

### regenerate contracts/artifacts

These artifacts are produced by AZTEC/packages/protocol scripts.
Run:
```
git clone git@github.com:AztecProtocol/AZTEC.git
cd AZTEC/packages/protocol
yarn install
yarn run compile
yarn run build:artifacts
```
Will generate JSON artifacts for the contracts in `AZTEC/packages/contract-artifacts/artifacts/`