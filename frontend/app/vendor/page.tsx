"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  ExternalLink,
  Wallet,
  Send,
  History,
} from "lucide-react";
import { Web3Button } from "@/components/ui/web3-button";
import { Web3Header } from "@/components/web3-header";
import { Web3Card } from "@/components/ui/web3-card";
import { ethers } from "ethers";
import BusinessWalletResolverABI from "@/abi/BusinessWalletResolver.json";

// Add this custom style for number input to remove spinner buttons
const numberInputStyles = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

// Add this interface after the imports
interface Transaction {
  id: number;
  domain: string;
  amount: string;
  date: string;
  status: string;
  txHash: string;
}

// Helper functions
const truncateHash = (hash: string) => {
  if (!hash) return "";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const getEtherscanUrl = (txHash: string) => {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
};

export default function VendorPortal() {
  const [ensDomain, setEnsDomain] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [isLoading, setIsLoading] = useState(false);
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [resolvedWallet, setResolvedWallet] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionError, setResolutionError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      domain: "business.eth",
      amount: "0.5 ETH",
      date: "2024-04-01",
      status: "completed",
      txHash: "0x72e8f44df45ee1ba2682faafa475b0e6c1f8e306e0cdd8671507397eebe98ebc",
    },
    {
      id: 2,
      domain: "business.eth",
      amount: "1.2 ETH",
      date: "2024-03-28",
      status: "completed",
      txHash: "0x545877aff86fd9219824b4c46ef91d8867f8cd16e0d8ea17cface30cb4c1d891",
    },
    {
      id: 3,
      domain: "company.eth",
      amount: "0.3 ETH",
      date: "2024-03-15",
      status: "pending",
      txHash: "0x942a952442d754327f71794481576340f2a6ee5832f066a2f5ca7ee80cbbd8e2",
    },
  ]);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleResolveDomain = useCallback(async () => {
    if (!ensDomain) return;

    setIsResolving(true);
    setResolutionError(null);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Get the domain hash
      const domainHash = ethers.utils.namehash(ensDomain);
      console.log("Domain hash:", domainHash);

      // Create contract instance
      const resolverContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_BUSINESS_WALLET_RESOLVER_ADDRESS!,
        BusinessWalletResolverABI.abi,
        signer
      );

      // First try to get existing wallet
      const existingWallet = await resolverContract.getWallet(
        domainHash,
        await signer.getAddress()
      );
      console.log("Existing wallet:", existingWallet);

      if (existingWallet === ethers.constants.AddressZero) {
        // No existing wallet, create new one
        console.log("No existing wallet, creating new one...");
        const tx = await resolverContract.getOrCreateWallet(
          domainHash,
          await signer.getAddress()
        );
        const receipt = await tx.wait();

        // Get the wallet address from events or make another call to getWallet
        const newWallet = await resolverContract.getWallet(
          domainHash,
          await signer.getAddress()
        );
        setResolvedWallet(newWallet);
      } else {
        // Existing wallet found
        setResolvedWallet(existingWallet);
      }
    } catch (error: any) {
      console.error("Resolution error:", error);
      setResolutionError(error.message || "Failed to resolve domain");
    } finally {
      setIsResolving(false);
    }
  }, [ensDomain]);

  const handleSendTransaction = async () => {
    if (!resolvedWallet || !amount) return;

    setIsLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this feature");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create transaction object
      const tx = {
        to: resolvedWallet,
        value: ethers.utils.parseEther(amount),
      };

      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      console.log("Transaction sent:", transaction.hash);

      // Add to transactions list
      setTransactions([
        {
          id: transactions.length + 1,
          domain: ensDomain,
          amount: `${amount} ETH`,
          date: new Date().toISOString().split("T")[0],
          status: "pending",
          txHash: transaction.hash,
        },
        ...transactions,
      ]);

      // Wait for transaction to be mined
      const receipt = await transaction.wait();
      console.log("Transaction confirmed:", receipt);

      // Update the transaction status to completed
      setTransactions((prevTx) =>
        prevTx.map((tx) =>
          tx.txHash === transaction.hash ? { ...tx, status: "completed" } : tx
        )
      );

      // Reset form
      setEnsDomain("");
      setAmount("");
    } catch (error: any) {
      console.error("Transaction error:", error);
      alert(error.message || "Failed to send transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      // CSV Headers
      ["ENS Domain", "Amount", "Date", "Status", "Transaction Hash"].join(","),
      // CSV Data
      ...transactions.map((tx: Transaction) =>
        [tx.domain, tx.amount, tx.date, tx.status, tx.txHash].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get the first wallet address from the user's linked wallets
  const walletAddress =
    user?.wallet?.address || user?.linkedAccounts?.[0]?.address;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Add the style tag for number input */}
      <style>{numberInputStyles}</style>

      <Web3Header
        isConnected={authenticated}
        address={walletAddress}
        onConnect={handleConnect}
        onDisconnect={logout}
        showSettings={true}
      />

      <main className="flex-1">
        {!ready ? (
          <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12">
            <Web3Card className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center py-8">
                <Clock className="h-6 w-6 animate-spin text-primary" />
              </div>
            </Web3Card>
          </div>
        ) : !authenticated ? (
          <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12">
            <Web3Card className="max-w-2xl mx-auto">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
                <p className="text-muted-foreground mb-6">
                  Please connect your wallet to access the vendor portal
                </p>
                <div className="rounded-lg bg-muted/50 p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Why connect your wallet?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Connecting your wallet allows you to send transactions to
                    businesses using their ENS domains. Our system will
                    automatically resolve to your dedicated wallet address for
                    each business relationship.
                  </p>
                </div>
                <Web3Button onClick={handleConnect} className="w-full" glowing>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Web3Button>
              </div>
            </Web3Card>
          </div>
        ) : (
          <div className="container mx-auto px-4 md:px-6 max-w-3xl py-8">
            {/* Vendor Interface Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Vendor Interface</h1>
              <p className="text-gray-600">
                Resolve business ENS names to their dedicated wallet address for
                your relationship
              </p>
            </div>

            {/* Tabs */}
            <div className="flex mb-8 border-b">
              <button
                className={`px-6 py-3 flex items-center ${
                  activeTab === "send"
                    ? "border-b-2 border-primary text-primary font-medium"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("send")}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Transaction
              </button>
              <button
                className={`px-6 py-3 flex items-center ${
                  activeTab === "history"
                    ? "border-b-2 border-primary text-primary font-medium"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </button>
            </div>

            {/* Send Transaction Content */}
            {activeTab === "send" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Resolve Business ENS Name
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Enter the ENS name of the business you want to transact
                    with. Our resolver will return the wallet address specific
                    to your relationship.
                  </p>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="ens">Business ENS Name</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="ens"
                          placeholder="business.eth"
                          value={ensDomain}
                          onChange={(e) => {
                            setEnsDomain(e.target.value);
                            setResolvedWallet(null);
                            setResolutionError(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-gray-100/10 border-gray-700 focus:border-primary focus:ring-primary"
                        />
                        <Web3Button
                          onClick={handleResolveDomain}
                          disabled={!ensDomain || isResolving}
                          className="px-6"
                        >
                          {isResolving ? (
                            <>
                              <Clock className="mr-2 h-4 w-4 animate-spin" />
                              Resolving...
                            </>
                          ) : (
                            "Resolve"
                          )}
                        </Web3Button>
                      </div>
                      {resolutionError && (
                        <p className="text-sm text-red-500 mt-1">
                          <AlertCircle className="inline-block h-4 w-4 mr-1" />
                          {resolutionError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (ETH)</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="px-4 py-2 rounded-lg bg-gray-100/10 border-gray-700 focus:border-primary focus:ring-primary"
                          step="0.000001"
                          min="0"
                        />
                        {/* <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-sm text-gray-500">ETH</span>
                        </div> */}
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-200 p-4 space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">
                          {resolvedWallet ? (
                            <>
                              Resolved wallet: {resolvedWallet.slice(0, 6)}...
                              {resolvedWallet.slice(-4)}
                            </>
                          ) : (
                            "Resolve an ENS domain to see the dedicated wallet address"
                          )}
                        </span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          {resolvedWallet
                            ? "This is your dedicated wallet address for transactions with this business."
                            : "Each business relationship gets a unique wallet address for privacy."}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Privacy Protected</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          Your transaction will be processed through our
                          privacy-preserving resolution system.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendTransaction}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                      disabled={!resolvedWallet || !amount || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Send Transaction</>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">How It Works</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-medium text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Enter the business ENS name
                        </h3>
                        <p className="text-gray-600">
                          The business provides you with their ENS name (e.g.,
                          business.eth)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-medium text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Our resolver uses EIP3668
                        </h3>
                        <p className="text-gray-600">
                          When you resolve the ENS name, our system uses EIP3668
                          to perform an off-chain lookup that identifies your
                          specific relationship with the business
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-medium text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Get a unique wallet address
                        </h3>
                        <p className="text-gray-600">
                          The resolver returns a wallet address that is unique
                          to your relationship with the business
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-medium text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Complete your transaction
                        </h3>
                        <p className="text-gray-600">
                          Send your payment to the resolved address, maintaining
                          privacy for both parties
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      Learn more about EIP3668
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Content */}
            {activeTab === "history" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      Transaction History
                    </h2>
                    <p className="text-gray-600">
                      View your past transactions and their status
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportTransactions}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search transactions..."
                        className="pl-8 bg-gray-100 border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 text-sm font-medium">
                      <div>ENS Domain</div>
                      <div>Amount</div>
                      <div>Date</div>
                      <div>Status</div>
                      <div>Transaction Hash</div>
                    </div>
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="grid grid-cols-5 gap-4 p-4 items-center text-sm border-t border-gray-200"
                      >
                        <div className="font-medium">{tx.domain}</div>
                        <div className="font-mono">{tx.amount}</div>
                        <div>{tx.date}</div>
                        <div>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              tx.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <span
                              className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                tx.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            ></span>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs">
                            {truncateHash(tx.txHash)}
                          </span>
                          <Link
                            href={getEtherscanUrl(tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="sr-only">View on Etherscan</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
              © 2024 BENS. All rights reserved.
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
