"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApp = exports.makeServer = void 0;
const ccip_read_server_1 = require("@chainlink/ccip-read-server");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const IResolverService_json_1 = require("./helpers/IResolverService.json");
const resolve_1 = __importDefault(require("./resolve"));
const decodeDnsName_1 = __importDefault(require("./helpers/decodeDnsName"));
const TTL = parseInt(process.env.TTL || "") || 300;
function makeServer(signer) {
    const server = new ccip_read_server_1.Server();
    server.add(IResolverService_json_1.abi, [
        {
            type: "resolve",
            func: async ([encodedName, data], request) => {
                try {
                    // Extract the actual sender from the data parameter
                    const name = (0, decodeDnsName_1.default)(Buffer.from(encodedName.slice(2), "hex"));
                    // Decode the function being called from data
                    const functionSig = data.slice(0, 10); // First 4 bytes is function selector
                    console.log("Function signature:", functionSig);
                    let originalSender;
                    try {
                        // For other functions, try to decode the sender from the data
                        const IResolverService = new utils_1.Interface(IResolverService_json_1.abi);
                        const decodedData = IResolverService.decodeFunctionData("resolve", data);
                        console.log("Decoded data:", decodedData);
                        originalSender =
                            "0xb16949bF0cdaC5b2d49721744602c32239BE8DF3";
                    }
                    catch (error) {
                        console.log("Error decoding sender:", error);
                        originalSender = request?.to;
                    }
                    console.log("Resolution request:", {
                        name,
                        originalSender,
                        functionSig,
                        data,
                        encodedName,
                        resolverAddress: request?.to,
                    });
                    const result = await (0, resolve_1.default)(name, originalSender, data);
                    console.log("Resolve Result:", result);
                    const validUntil = Math.floor(Date.now() / 1000 + TTL);
                    let messageHash = ethers_1.ethers.utils.solidityKeccak256(["bytes", "address", "uint64", "bytes32", "bytes32"], [
                        "0x1900",
                        request?.to,
                        validUntil,
                        ethers_1.ethers.utils.keccak256(request?.data || "0x"),
                        ethers_1.ethers.utils.keccak256(result),
                    ]);
                    const sig = signer.signDigest(messageHash);
                    const sigData = (0, utils_1.hexConcat)([sig.r, sig._vs]);
                    return [result, validUntil, sigData];
                }
                catch (err) {
                    console.error("Server error:", err);
                    throw err;
                }
            },
        },
    ]);
    return server;
}
exports.makeServer = makeServer;
function makeApp(signer, path) {
    return makeServer(signer).makeApp(path);
}
exports.makeApp = makeApp;
