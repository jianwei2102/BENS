import { Server } from "@chainlink/ccip-read-server";
import { ethers } from "ethers";
import { makeServer } from "./server";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

const signer = new ethers.utils.SigningKey(PRIVATE_KEY);
const server = makeServer(signer);
const app = server.makeApp("/gateway");

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});
