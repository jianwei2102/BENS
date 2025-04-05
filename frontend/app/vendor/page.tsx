"use client";

import { useState } from "react";
import Link from "next/link";
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

// Mock wallet connection hooks
function useWalletConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);

  const connect = async () => {
    // Mock wallet address
    setAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    setIsConnected(true);
    return true;
  };

  return {
    isConnected,
    address,
    connect,
  };
}

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

export default function VendorPortal() {
  const [ensDomain, setEnsDomain] = useState("");
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      domain: "business.eth",
      amount: "0.5 ETH",
      date: "2024-04-01",
      status: "completed",
      txHash: "0x1234...5678",
    },
    {
      id: 2,
      domain: "business.eth",
      amount: "1.2 ETH",
      date: "2024-03-28",
      status: "completed",
      txHash: "0x8765...4321",
    },
    {
      id: 3,
      domain: "company.eth",
      amount: "0.3 ETH",
      date: "2024-03-15",
      status: "pending",
      txHash: "0xabcd...efgh",
    },
  ]);

  const { isConnected, address, connect } = useWalletConnection();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleSendTransaction = () => {
    // In a real implementation, this would interact with your smart contract
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Add new transaction to history
      setTransactions([
        {
          id: transactions.length + 1,
          domain: ensDomain,
          amount: `${amount} ETH`,
          date: new Date().toISOString().split("T")[0],
          status: "pending",
          txHash: `0x${Math.random()
            .toString(16)
            .substring(2, 10)}...${Math.random()
            .toString(16)
            .substring(2, 10)}`,
        },
        ...transactions,
      ]);
      // Reset form
      setEnsDomain("");
      setAmount("");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Add the style tag for number input */}
      <style>{numberInputStyles}</style>

      {/* Updated Header to match consistent styling */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-secondary opacity-75 blur"></div>
                <Wallet className="relative h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">BENS</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                variant="outline"
                className="bg-gradient-dark hover:opacity-90"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span className="font-mono text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!isConnected ? (
          <div className="container mx-auto px-4 md:px-6 max-w-3xl py-12">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
              <p className="text-gray-600">
                Please connect your wallet to access the vendor portal
              </p>
              <div className="rounded-lg bg-gray-100 p-4 mx-auto max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Why connect your wallet?</h3>
                </div>
                <p className="text-sm text-gray-600 text-left">
                  Connecting your wallet allows you to send transactions to
                  businesses using their ENS domains. Our system will
                  automatically resolve to your dedicated wallet address for
                  each business relationship.
                </p>
              </div>
              <Button
                onClick={handleConnect}
                className="mt-4 bg-gradient-to-r from-primary to-secondary text-white"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </div>
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
                          onChange={(e) => setEnsDomain(e.target.value)}
                          className="px-4 py-2 rounded-lg bg-gray-100/10 border-gray-700 focus:border-primary focus:ring-primary"
                        />
                        <Button className="rounded-lg bg-primary hover:bg-primary/90 text-white px-6">
                          Resolve
                        </Button>
                      </div>
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
                          Your resolved wallet: {address?.slice(0, 6)}...
                          {address?.slice(-4)}
                        </span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          This transaction will be automatically associated with
                          your vendor relationship for future reference.
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
                      disabled={!ensDomain || !amount || isLoading}
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
                    <Button variant="outline" size="sm">
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
                          <span className="font-mono text-xs">{tx.txHash}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="sr-only">View on explorer</span>
                          </Button>
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

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-gray-500" />
            <p className="text-center text-sm leading-loose text-gray-500">
              © 2024 BENS. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/terms"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
