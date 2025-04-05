"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const BusinessWalletResolver_json_1 = __importDefault(require("./helpers/BusinessWalletResolver.json"));
require("dotenv/config");
const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const BUSINESS_WALLETS_RESOLVER_ADDRESS = process.env.BUSINESS_WALLETS_RESOLVER_ADDRESS;
if (!BUSINESS_WALLETS_RESOLVER_ADDRESS) {
    throw new Error("BUSINESS_WALLETS_RESOLVER_ADDRESS is not defined");
}
const resolve = async (name, sender, data) => {
    try {
        // Create a contract instance
        const resolverContract = new ethers_1.ethers.Contract(BUSINESS_WALLETS_RESOLVER_ADDRESS, BusinessWalletResolver_json_1.default.abi, provider);
        // Calculate the domain hash from the name
        const domainHash = ethers_1.ethers.utils.namehash(name);
        // Call the getWallet function with domainHash and sender address
        const walletAddress = await resolverContract.getWallet(domainHash, sender);
        // Return the wallet address as a hex string
        return ethers_1.ethers.utils.hexlify(walletAddress);
    }
    catch (error) {
        console.error("Error resolving address:", error);
        throw new Error("Failed to resolve address for sender");
    }
};
exports.default = resolve;
// Notes on security
// 1. CCIP server is the msg.sender to contract, not the orginalSender. Hence we still sender in the getWallet params.
//    But this may mean that anyone can spam the contract to get destinationWallets.
//    => solution: Need to hash the addresses, or set gateway as authorised for this function
// 2. Anyone can observe the calls to contract and keep a record of all inputs and outputs
//    => solution: Need to hash the addresses
