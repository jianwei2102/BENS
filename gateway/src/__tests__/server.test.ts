// import { ethers } from "ethers";
// import { CCIPServer, makeServer } from "../server";
// import { makeSignatureHash } from "../helpers/testHelpers";

// describe("CCIP-Read Server", () => {
//   const privateKey =
//     "0x1234567890123456789012345678901234567890123456789012345678901234";
//   const signer = new ethers.utils.SigningKey(privateKey);

//   it("should handle resolve requests", async () => {
//     const server = makeServer(signer) as CCIPServer;
//     const name = Buffer.from("test.eth").toString("hex");
//     const data = "0x1234";

//     const request = {
//       to: ethers.utils.computeAddress(signer.publicKey),
//       data: data,
//     };

//     const [result, expires, signature] = await server. .func(
//       [name, data],
//       request
//     );

//     expect(result).toBeDefined();
//     expect(expires).toBeGreaterThan(Math.floor(Date.now() / 1000));
//     expect(signature).toBeDefined();

//     // Verify signature
//     const messageHash = makeSignatureHash(
//       request.to,
//       expires,
//       request.data,
//       result
//     );

//     const recoveredAddress = ethers.utils.recoverAddress(
//       messageHash,
//       signature
//     );
//     expect(recoveredAddress.toLowerCase()).toBe(
//       ethers.utils.computeAddress(signer.publicKey).toLowerCase()
//     );
//   });
// });
