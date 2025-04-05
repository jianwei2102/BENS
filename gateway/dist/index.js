"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const server_1 = require("./server");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
}
const signer = new ethers_1.ethers.utils.SigningKey(PRIVATE_KEY);
const server = (0, server_1.makeServer)(signer);
const app = server.makeApp("/gateway");
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Gateway server running on port ${PORT}`);
});
