# Quick Start Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Basic understanding of Ethereum and Solidity

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/fhevm-examples
cd fhevm-examples
```

2. Install dependencies:

```bash
npm install
```

## Compile Contracts

```bash
npm run compile
```

## Run Tests

```bash
npm test
```

For verbose output:

```bash
npm run test:verbose
```

For gas reporting:

```bash
npm run test:gas
```

## Local Deployment

1. Start a local Hardhat node:

```bash
npm run node
```

2. In another terminal, deploy:

```bash
npm run deploy:local
```

## Testnet Deployment

1. Create `.env` file:

```bash
cp .env.template .env
```

2. Add your credentials:

```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
```

3. Deploy to Sepolia:

```bash
npm run deploy
```

## Next Steps

- Explore the [Concepts](concepts/) section
- Review the [Examples](examples/)
- Check the [API Reference](api/)

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Community Discord](https://discord.gg/zama)
