"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { keccak256, namehash } from "ethers/lib/utils";
import ensControllerJson from "@/abi/ensController.json";
import { convertToSeconds } from "@/utils/convertToSeconds";
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  Building,
  Users,
  MoreVertical,
  Edit2,
  Send,
  Ban,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Web3Card } from "@/components/ui/web3-card";
import { Web3Button } from "@/components/ui/web3-button";
import { Web3Input } from "@/components/ui/web3-input";
import { Web3Header } from "@/components/web3-header";
import { Web3Particles } from "@/components/web3-particles";
import { Web3Badge } from "@/components/ui/web3-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusinessPortal() {
  const [ensDomain, setEnsDomain] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("");

  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: "Vendor A",
      address: "0x123...abc",
      resolvedWallet: "0x456...def",
      status: "active",
      transactions: 12,
      totalValue: "3.5 ETH",
    },
    {
      id: 2,
      name: "Vendor B",
      address: "0x789...ghi",
      resolvedWallet: "0x012...jkl",
      status: "active",
      transactions: 8,
      totalValue: "1.2 ETH",
    },
    {
      id: 3,
      name: "Vendor C",
      address: "0xabc...xyz",
      resolvedWallet: "0xdef...uvw",
      status: "inactive",
      transactions: 3,
      totalValue: "0.5 ETH",
    },
  ]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const ensureSepoliaNetwork = async (
    provider: ethers.providers.Web3Provider
  ) => {
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      // Sepolia chainId
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chainId in hex
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [
                  "https://sepolia.infura.io/v3/b403dd2687094ab3fc4e3858d2d7d9",
                ],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } else {
          throw error;
        }
      }
    }
  };

  const handleRegisterENS = async () => {
    if (!ensDomain) return;
    // handleVerify();


    setIsRegistering(true);
    setRegistrationStatus("Starting registration...");

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      await ensureSepoliaNetwork(provider);

      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      console.log("Connected to network:", network);

      const ensController = new ethers.Contract(
        process.env.NEXT_PUBLIC_ENS_CONTROLLER_ADDRESS!,
        ensControllerJson.abi,
        signer
      );

      console.log("Checking availability for:", ensDomain);
      const available = await ensController.available(ensDomain);
      console.log("Domain available:", available);

      if (!available) {
        setRegistrationStatus("Domain not available");
        return;
      }

      setRegistrationStatus("Domain available, creating commitment...");

      const secret = keccak256(ethers.utils.randomBytes(32));
      const duration = convertToSeconds({ days: 45 });
      const owner = await signer.getAddress();
      const resolverAddress = process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS;

      const commitmentParams = [
        ensDomain,
        owner,
        duration,
        secret,
        resolverAddress,
        [], // Empty data array
        false, // No reverse record
        0, // No fuses
      ];

      const commitment = await ensController.makeCommitment(
        ...commitmentParams
      );
      setRegistrationStatus("Submitting commitment...");

      const commitTx = await ensController.commit(commitment, {
        gasLimit: 50000,
      });
      await commitTx.wait();

      setRegistrationStatus(
        "Waiting for commitment to be ready (70 seconds)..."
      );
      await new Promise((resolve) => setTimeout(resolve, 70000));

      const rentPrice = (await ensController.rentPrice(ensDomain, duration))[0];
      setRegistrationStatus(
        `Registering domain for ${ethers.utils.formatEther(rentPrice)} ETH...`
      );

      const tx = await ensController.register(...commitmentParams, {
        value: rentPrice,
        gasLimit: 300000,
      });

      await tx.wait(2); // Wait for 2 block confirmations

      // Set the resolver
      await setENSName(provider, ensDomain);

      setRegistrationStatus(
        `✅ Domain "${ensDomain}.eth" registered successfully!`
      );
      setIsRegistered(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationStatus(
        `Error: ${error.message || "Unknown error occurred"}`
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const setENSName = async (
    provider: ethers.providers.Web3Provider,
    domain: string
  ) => {
    try {
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      const ensRegistry = new ethers.Contract(
        "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // ENS Registry on Sepolia
        [
          "function setResolver(bytes32 node, address resolver) public",
          "function owner(bytes32 node) public view returns (address)",
          "function resolver(bytes32 node) public view returns (address)",
        ],
        signer
      );

      const node = namehash(`${domain}.eth`);

      // Check ownership first
      const currentOwner = await ensRegistry.owner(node);
      console.log("Domain ownership:", {
        domain: `${domain}.eth`,
        currentOwner,
        signerAddress,
        node,
      });

      if (currentOwner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You don't own this domain");
      }

      // Get current resolver
      const currentResolver = await ensRegistry.resolver(node);
      const targetResolver = process.env.NEXT_PUBLIC_OFFCHAIN_RESOLVER_ADDRESS;

      console.log("Resolver status:", {
        currentResolver,
        targetResolver,
        needsUpdate:
          currentResolver.toLowerCase() !== targetResolver?.toLowerCase(),
      });

      // Only update resolver if needed
      if (currentResolver.toLowerCase() !== targetResolver?.toLowerCase()) {
        console.log("Setting resolver...");
        const tx = await ensRegistry.setResolver(node, targetResolver, {
          gasLimit: 100000,
        });
        await tx.wait();
        console.log("Resolver set successfully");
      } else {
        console.log("Resolver already set correctly");
      }

      return true;
    } catch (error) {
      // console.error("Error setting ENS name:", error);
      return false;
    }
  };

const verifyPayload: VerifyCommandInput = {
	action: 'voting-action', // This is your action ID from the Developer Portal
	signal: '0x12312', // Optional additional data
	verification_level: VerificationLevel.Orb, // Orb | Device
}

const handleVerify = async () => {
	if (!MiniKit.isInstalled()) {
		return
	}
	// World App will open a drawer prompting the user to confirm the operation, promise is resolved once user confirms or cancels
	const {finalPayload} = await MiniKit.commandsAsync.verify(verifyPayload)
		if (finalPayload.status === 'error') {
			return console.log('Error payload', finalPayload)
		}

		// Verify the proof in the backend
		const verifyResponse = await fetch('/api/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
			payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
			action: 'register-ens',
		}),
	})

	// TODO: Handle Success!
	const verifyResponseJson = await verifyResponse.json()
	if (verifyResponseJson.status === 200) {
		console.log('Verification success!')
	}
}

  const filteredVendors = vendors.filter((vendor) => {
    if (activeTab === "all") return true;
    return vendor.status === activeTab;
  });

  // Get the first wallet address from the user's linked wallets
  const walletAddress =
    user?.wallet?.address || user?.linkedAccounts?.[0]?.address;

  return (
    <div className="flex min-h-screen flex-col">
      <Web3Particles />
      <div className="fixed inset-0 bg-gradient-glow -z-10" />

      <Web3Header
        isConnected={authenticated}
        address={walletAddress}
        onConnect={handleConnect}
        onDisconnect={logout}
        showSettings={true}
      />

      <main className="flex-1">
        {!ready ? (
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-12">
            <Web3Card className="max-w-2xl mx-auto">
              <CardContent className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            </Web3Card>
          </div>
        ) : !authenticated ? (
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-12">
            <Web3Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Please connect your wallet to access the business portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Why connect your wallet?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connecting your wallet allows you to register and manage
                    your ENS domains, control vendor relationships, and maintain
                    privacy for your business transactions.
                  </p>
                </div>
                <Web3Button onClick={handleConnect} className="w-full" glowing>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Web3Button>
              </CardContent>
            </Web3Card>
          </div>
        ) : (
          <div className="container mx-auto px-4 md:px-6 max-w-6xl py-12">
            <div className="flex flex-col space-y-8">
              {/* ENS Registration/Configuration Section */}
              <Web3Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm"></div>
                        <Building className="relative h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>ENS Domain Configuration</CardTitle>
                        <CardDescription>
                          {isRegistered
                            ? "Manage your ENS domain settings and resolution rules"
                            : "Register your ENS domain to start managing vendor relationships"}
                        </CardDescription>
                      </div>
                    </div>
                    {isRegistered && (
                      <Web3Badge>
                        <div className="flex items-center text-white">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </div>
                      </Web3Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isRegistered ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="ens">ENS Domain</Label>
                        <div className="relative">
                          <Web3Input
                            id="ens"
                            placeholder="yourbusiness.eth"
                            value={ensDomain}
                            onChange={(e) => setEnsDomain(e.target.value)}
                            className="pr-16"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-sm text-muted-foreground">.eth</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                        <h3 className="font-medium">How it works</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-bold">
                                1
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Register your ENS domain through our platform
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-bold">
                                2
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Your main wallet address remains private
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-bold">
                                3
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Vendors will be automatically assigned unique
                              resolved addresses
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-bold">
                                4
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              All transactions are tracked and managed through
                              our system
                            </p>
                          </div>
                        </div>
                      </div>

                      <Web3Button
                        onClick={handleRegisterENS}
                        className="w-full"
                        disabled={!ensDomain || isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Registering Domain...
                          </>
                        ) : (
                          "Register Domain"
                        )}
                      </Web3Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Registered Domain
                          </p>
                          <div className="flex items-center">
                            <p className="text-2xl font-bold gradient-text">
                              {ensDomain}.eth
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy domain</span>
                            </Button>
                          </div>
                        </div>
                        <Web3Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update Configuration
                        </Web3Button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Main Wallet</Label>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                            <div className="flex items-center space-x-2">
                              <Wallet className="h-4 w-4 text-primary" />
                              <span className="font-mono text-sm">
                                {walletAddress?.slice(0, 6)}...
                                {walletAddress?.slice(-4)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy address</span>
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This address is kept private from vendors
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Resolution Status</Label>
                          <div className="p-3 rounded-lg bg-muted">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium">
                                  Active
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Last updated: 2 hours ago
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Vendor Relationships: 3</span>
                            <span>Total Transactions: 23</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Zap className="h-5 w-5 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">3</div>
                          <div className="text-xs text-muted-foreground">
                            Active Vendors
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Send className="h-5 w-5 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">23</div>
                          <div className="text-xs text-muted-foreground">
                            Transactions
                          </div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                          <Wallet className="h-5 w-5 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">5.2 ETH</div>
                          <div className="text-xs text-muted-foreground">
                            Total Volume
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Web3Card>

              {/* Vendor Management Section */}
              {isRegistered && (
                <Web3Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-30 blur-sm"></div>
                          <Users className="relative h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Vendor Management</CardTitle>
                          <CardDescription>
                            View and manage your vendor relationships and their
                            resolved wallet addresses
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="mb-6"
                    >
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Vendors</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="space-y-4">
                      <div className="rounded-lg border overflow-hidden">
                        <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 text-sm font-medium">
                          <div>Vendor Name</div>
                          <div>Vendor Address</div>
                          <div>Resolved Wallet</div>
                          <div>Status</div>
                          <div>Transactions</div>
                          <div>Total Value</div>
                          <div>Actions</div>
                        </div>
                        {filteredVendors.map((vendor) => (
                          <div
                            key={vendor.id}
                            className="grid grid-cols-7 gap-4 p-4 items-center text-sm border-t"
                          >
                            <div className="font-medium">{vendor.name}</div>
                            <div className="font-mono text-xs">
                              {vendor.address}
                            </div>
                            <div className="font-mono text-xs">
                              {vendor.resolvedWallet}
                            </div>
                            <div>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  vendor.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                <span
                                  className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                    vendor.status === "active"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></span>
                                {vendor.status}
                              </span>
                            </div>
                            <div>{vendor.transactions}</div>
                            <div>{vendor.totalValue}</div>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Transaction
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Ban className="h-4 w-4 mr-2" />
                                    {vendor.status === "active"
                                      ? "Disable"
                                      : "Enable"}{" "}
                                    Resolution
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Web3Card>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-secondary opacity-50 blur-sm"></div>
              <Wallet className="relative h-5 w-5 text-white" />
            </div>
            <p className="text-center text-sm leading-loose text-muted-foreground">
              © 2025 BENS. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
