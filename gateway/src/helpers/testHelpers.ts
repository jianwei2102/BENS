import { ethers } from "ethers";

export function makeSignatureHash(
  target: string,
  expires: number,
  request: string,
  result: string
): string {
  return ethers.utils.solidityKeccak256(
    ["bytes", "address", "uint64", "bytes32", "bytes32"],
    [
      "0x1900",
      target,
      expires,
      ethers.utils.keccak256(request),
      ethers.utils.keccak256(result),
    ]
  );
}
