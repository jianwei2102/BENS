import { ethers } from "ethers";
import { makeApp } from "./server";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is required");
}

const signer = new ethers.utils.SigningKey(PRIVATE_KEY);
const app = makeApp(signer, "/gateway");

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Gateway server running on port ${PORT}`);
});
