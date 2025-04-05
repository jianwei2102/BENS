"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSignatureHash = void 0;
const ethers_1 = require("ethers");
function makeSignatureHash(target, expires, request, result) {
    return ethers_1.ethers.utils.solidityKeccak256(["bytes", "address", "uint64", "bytes32", "bytes32"], [
        "0x1900",
        target,
        expires,
        ethers_1.ethers.utils.keccak256(request),
        ethers_1.ethers.utils.keccak256(result),
    ]);
}
exports.makeSignatureHash = makeSignatureHash;
