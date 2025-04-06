# BENS (Business ENS)

## Short Description

Privacy-focused ENS resolver that generates unique wallet addresses for each business relationship while maintaining anonymity.

## Problem

Traditional ENS resolution limits businesses to one wallet address per domain, exposing transaction relationships and lacking privacy in B2B interactions.

## Solution

BENS enables businesses to:

- Register domains privately with World ID verification
- Generate unique wallets for each sender
- Maintain consistent B2B relationships
- Keep business wallet addresses private
- Enable future invoice tracking

## How it Works

1. Business registers ENS domain (verified by World ID)
2. Users query the business domain
3. System generates deterministic wallet based on sender + domain
4. Same sender always gets same wallet for consistent tracking

## Technical Implementation

- **Smart Contracts**: Solidity 0.8.28, implementing EIP-3668 (CCIP-Read)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Authentication**: Privy for wallet connection
- **Privacy**: Off-chain resolution with cryptographic verification
- **Identity**: World ID for business verification

## Key Features

- Privacy-preserving ENS resolution
- Deterministic wallet generation
- Off-chain business relationship management
- World ID verification for businesses
- Consistent sender-wallet mapping

## Tech Stack

- Solidity & Hardhat
- Next.js & TypeScript
- ENS & CCIP-Read
- World ID
- Privy Auth
- Ethers.js

## Future Extensions

- Automated invoice tracking
- Multi-token support
- Business analytics dashboard
- Multi-chain expansion
- DeFi integrations

## Why ENS Track?

BENS enhances ENS infrastructure with privacy features and enables new B2B use cases through innovative domain resolution, making it perfect for both "Best ENS Infrastructure" and "Best use of ENS" categories.

## Why World ID?

Integrates World ID verification to ensure only legitimate human entities can register business domains, preventing Sybil attacks while maintaining privacy through zero-knowledge proofs.

## Why Celo?

BENS leverages Celo's L2 capabilities to provide:

- Sub-cent transaction fees for wallet creation and resolution
- Fast 1-second finality for business transactions
- Full EVM compatibility for seamless deployment

## Deployments & Contract Addresses

### Core Smart Contracts

1. **OffChainResolver (Sepolia)**

   - Purpose: Entry point for ENS resolution, implements CCIP-Read pattern
   - Address: [`0x26220342ccB9b3b7C74d1141726859116780fcf2`](https://sepolia.etherscan.io/address/0x26220342ccB9b3b7C74d1141726859116780fcf2)

2. **BusinessWalletResolver**

   - Purpose: Manages wallet resolution and business relationships
   - Sepolia: [`0xfe279ce7e13e007662a37a64f8e0251494ca0ab5`](https://sepolia.etherscan.io/address/0xfe279ce7e13e007662a37a64f8e0251494ca0ab5)
   - Celo: [`0x493512cd3b8D42b3B5de2B99F34eB52f6E6a6ad2`](https://celo.blockscout.com/address/0x493512cd3b8D42b3B5de2B99F34eB52f6E6a6ad2)


3. **BusinessWalletFactory**

   - Purpose: Deterministic wallet generation for business relationships
   - Sepolia: [`0x2A0a4c0f499553EB2B4267F3922a9777FACcAd5F`](https://sepolia.etherscan.io/address/0x2A0a4c0f499553EB2B4267F3922a9777FACcAd5F)
   - Celo: [`0xa4aB04486362F9FFA51cA7f3dAa6Ad2F93f7123C`](https://celo.blockscout.com/address/0xa4aB04486362F9FFA51cA7f3dAa6Ad2F93f7123C)

4. **ENS Controller**
   - Purpose: Manages ENS domain registrations and updates
   - Address: `0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72`
