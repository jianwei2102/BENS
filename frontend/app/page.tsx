import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Building,
  Users,
  Shield,
  Lock,
  Wallet,
  Zap,
  RefreshCw,
  Key,
  FileText,
} from "lucide-react";
import { Web3Particles } from "@/components/web3-particles";
import { Web3Card } from "@/components/ui/web3-card";
import { Web3Button } from "@/components/ui/web3-button";
import { Web3Badge } from "@/components/ui/web3-badge";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Web3Particles />
      <div className="fixed inset-0 bg-gradient-glow -z-10" />

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
            <Button variant="outline">
              <Link href="/business">Business Portal</Link>
            </Button>
            <Web3Button className="bg-gradient-dark hover:opacity-90">
              <Link href="/vendor">Vendor Access</Link>
            </Web3Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 hexagon-bg opacity-30" />
          <div className="container mx-auto px-4 md:px-6 max-w-6xl relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Web3Badge>Web3 Privacy Solution</Web3Badge>
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl gradient-text">
                  Business ENS Resolution
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
                  BENS: Business ENS - Revolutionize your business transactions
                  with dynamic wallet resolution. Keep your main wallet private
                  while managing vendor relationships efficiently.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Web3Button size="lg" glowing>
                  <Link href="/business">
                    Launch Business Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Web3Button>
                <Button variant="outline" size="lg">
                  <Link href="/vendor">Access as Vendor</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 md:px-6 max-w-6xl mt-16">
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-30 blur-xl"></div>
              <div className="relative rounded-xl bg-white/20 backdrop-blur-lg border border-white/30 p-1 dark:bg-black/20 dark:border-gray-800/30">
                <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-950/80">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      business.eth
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 font-mono text-sm">
                    <div className="flex items-start">
                      <span className="mr-2 text-green-600 dark:text-green-400">
                        $
                      </span>
                      <span>
                        <span className="text-gray-800 dark:text-gray-200">
                          resolve
                        </span>
                        <span className="text-primary"> business.eth</span>
                      </span>
                    </div>
                    <div className="pl-4 text-gray-600 dark:text-gray-400">
                      Resolving ENS domain...
                    </div>
                    <div className="pl-4 text-gray-800 dark:text-gray-200">
                      <span className="text-green-600 dark:text-green-400">
                        ✓
                      </span>{" "}
                      Resolved to: 0x7F5E835B94Ccd03a84831D5B9C5fa7B3b85a1d22
                    </div>
                    <div className="flex items-start">
                      <span className="mr-2 text-green-600 dark:text-green-400">
                        $
                      </span>
                      <span>
                        <span className="text-gray-800 dark:text-gray-200">
                          send
                        </span>
                        <span className="text-primary"> 0.5 ETH</span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {" "}
                          to business.eth
                        </span>
                      </span>
                    </div>
                    <div className="pl-4 text-gray-600 dark:text-gray-400">
                      Processing transaction...
                    </div>
                    <div className="pl-4 text-gray-800 dark:text-gray-200">
                      <span className="text-green-600 dark:text-green-400">
                        ✓
                      </span>{" "}
                      Transaction successful!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-text">
                What is BENS?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                BENS (Business ENS) is a privacy-first ENS resolution system
                that allows businesses to maintain separate wallet addresses for
                each vendor relationship while keeping their main business
                wallet private.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-3 items-start">
              <Web3Card>
                <CardHeader className="space-y-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Privacy Protected</CardTitle>
                  <CardDescription>
                    Your main wallet address remains private while conducting
                    business transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Keep your primary business wallet secure and private. Only
                  share domain-specific addresses with vendors.
                </CardContent>
              </Web3Card>
              <Web3Card>
                <CardHeader className="space-y-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Resolution</CardTitle>
                  <CardDescription>
                    Automatic wallet resolution based on vendor relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Our system intelligently resolves to the correct wallet
                  address for each vendor, maintaining consistency across
                  transactions.
                </CardContent>
              </Web3Card>
              <Web3Card>
                <CardHeader className="space-y-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Seamless Integration</CardTitle>
                  <CardDescription>
                    Easy setup with existing ENS infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Integrate with your existing ENS domains and start managing
                  vendor relationships immediately.
                </CardContent>
              </Web3Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-text">
                  How It Works
                </h2>
                <p className="text-muted-foreground text-lg">
                  Our platform leverages advanced ENS resolution to provide a
                  unique wallet management system for businesses. When vendors
                  interact with your ENS name, they'll be directed to a wallet
                  address specific to their relationship with you.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Register your ENS domain through our platform
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vendors send transactions to your ENS domain
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Our system resolves to unique addresses for each vendor
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-primary font-bold">4</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track and manage all vendor relationships in one place
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <Web3Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Building className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>For Businesses</CardTitle>
                      <CardDescription>
                        Register your ENS domain and start managing vendor
                        relationships
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Register your ENS domain through our platform and maintain
                      separate wallet addresses for each vendor relationship,
                      all while keeping your main business wallet private.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Link
                        href="/business"
                        className="flex items-center justify-between"
                      >
                        Access Business Portal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Web3Card>
                <Web3Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>For Vendors</CardTitle>
                      <CardDescription>
                        Simple and consistent transaction experience
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simply use the business's ENS name for transactions. Our
                      system automatically resolves to your dedicated wallet
                      address, ensuring consistent tracking and future
                      invoicing.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Link
                        href="/vendor"
                        className="flex items-center justify-between"
                      >
                        Access Vendor Portal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Web3Card>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl gradient-text mb-4">
                Key Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Our platform offers a comprehensive suite of features designed
                for Web3 businesses
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Key className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Private Key Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Keep your business wallet keys secure and private
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <RefreshCw className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Dynamic Resolution
                </h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent address resolution based on transaction history
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Automated Invoicing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate and track invoices for each vendor relationship
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Quick setup with existing ENS infrastructure
                </p>
              </div>
            </div>
          </div>
        </section>
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
