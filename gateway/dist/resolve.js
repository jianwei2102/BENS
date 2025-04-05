"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
// import businessWalletsResolver from "./helpers/BusinessWalletsResolver.json";
require("dotenv/config");
const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// This is the address of my deployed BusinessWalletsResolver contract
const BUSINESS_WALLETS_RESOLVER_ADDRESS = process.env.BUSINESS_WALLETS_RESOLVER_ADDRESS;
if (!BUSINESS_WALLETS_RESOLVER_ADDRESS) {
    throw new Error("BUSINESS_WALLETS_RESOLVER_ADDRESS is not defined");
}
async function resolve(name, sender, data) {
    console.log("Resolving:", { name, sender, data });
    // For testing, return a hardcoded address
    // TODO: Implement actual resolution logic
    return ethers_1.ethers.utils.defaultAbiCoder.encode(["address"], ["0x1234567890123456789012345678901234567890"]);
}
exports.default = resolve;
// Notes on security
// 1. CCIP server is the msg.sender to contract, not the orginalSender. Hence we still sender in the getWallet params.
//    But this may mean that anyone can spam the contract to get destinationWallets.
//    => solution: Need to hash the addresses, or set gateway as authorised for this function
// 2. Anyone can observe the calls to contract and keep a record of all inputs and outputs
//    => solution: Need to hash the addresses
