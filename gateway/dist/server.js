"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeServer = exports.CCIPServer = void 0;
const ccip_read_server_1 = require("@chainlink/ccip-read-server");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const IResolverService_json_1 = require("./helpers/IResolverService.json");
const resolve_1 = __importDefault(require("./resolve"));
const decodeDnsName_1 = __importDefault(require("./helpers/decodeDnsName"));
const TTL = parseInt(process.env.TTL || "") || 300;
class CCIPServer extends ccip_read_server_1.Server {
    constructor(signer) {
        super();
        this.signer = signer;
        this.addResolver();
    }
    addResolver() {
        this.add(IResolverService_json_1.abi, [
            {
                type: "resolve",
                func: async ([encodedName, data], request) => {
                    try {
                        console.log("Incoming request:", { encodedName, data });
                        const sender = ethers_1.ethers.utils.getAddress(ethers_1.ethers.utils.hexlify(request?.to));
                        console.log("sender :", sender);
                        const name = (0, decodeDnsName_1.default)(Buffer.from(encodedName.slice(2), "hex"));
                        console.log("Decoded ENS Name:", name);
                        const result = await (0, resolve_1.default)(name, sender, data);
                        console.log("Resolve Result:", result);
                        const validUntil = Math.floor(Date.now() / 1000 + TTL);
                        let messageHash = ethers_1.ethers.utils.solidityKeccak256(["bytes", "address", "uint64", "bytes32", "bytes32"], [
                            "0x1900",
                            request?.to,
                            validUntil,
                            ethers_1.ethers.utils.keccak256(request?.data || "0x"),
                            ethers_1.ethers.utils.keccak256(result),
                        ]);
                        const sig = this.signer.signDigest(messageHash);
                        const sigData = (0, utils_1.hexConcat)([sig.r, sig._vs]);
                        return [result, validUntil, sigData];
                    }
                    catch (err) {
                        console.log({ err });
                        throw err;
                    }
                },
            },
        ]);
    }
}
exports.CCIPServer = CCIPServer;
function makeServer(signer) {
    return new CCIPServer(signer);
}
exports.makeServer = makeServer;
