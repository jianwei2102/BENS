import { Server } from "@chainlink/ccip-read-server";
import { ethers } from "ethers";
import { hexConcat, Result } from "ethers/lib/utils";
import { abi as IResolverService_abi } from "./helpers/IResolverService.json";
import resolve from "./resolve";
import decodeDnsName from "./helpers/decodeDnsName";

const TTL = parseInt(process.env.TTL || "") || 300;

export function makeServer(signer: ethers.utils.SigningKey) {
  const server = new Server();
  server.add(IResolverService_abi, [
    {
      type: "resolve",
      func: async ([encodedName, data]: Result, request) => {
        try {
          console.log("Incoming request:", { encodedName, data });
          const sender = ethers.utils.getAddress(
            ethers.utils.hexlify(request?.to)
          );
          console.log("sender :", sender);

          const name = decodeDnsName(Buffer.from(encodedName.slice(2), "hex"));
          console.log("Decoded ENS Name:", name);

          const result = await resolve(name, sender, data);
          console.log("Resolve Result:", result);

          const validUntil = Math.floor(Date.now() / 1000 + TTL);

          let messageHash = ethers.utils.solidityKeccak256(
            ["bytes", "address", "uint64", "bytes32", "bytes32"],
            [
              "0x1900",
              request?.to,
              validUntil,
              ethers.utils.keccak256(request?.data || "0x"),
              ethers.utils.keccak256(result),
            ]
          );

          const sig = signer.signDigest(messageHash);
          const sigData = hexConcat([sig.r, sig._vs]);
          return [result, validUntil, sigData];
        } catch (err) {
          console.log({ err });
          throw err;
        }
      },
    },
  ]);
  return server;
}

export function makeApp(signer: ethers.utils.SigningKey, path: string) {
  return makeServer(signer).makeApp(path);
}
