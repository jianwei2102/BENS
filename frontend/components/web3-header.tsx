"use client"

import Link from "next/link"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Web3Button } from "@/components/ui/web3-button"

interface Web3HeaderProps {
  isConnected?: boolean
  address?: string
  onConnect?: () => void
  showSettings?: boolean
}

export function Web3Header({ isConnected = false, address, onConnect, showSettings = false }: Web3HeaderProps) {
  return (
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
          <Button variant="outline" asChild>
            <Link href="/business">Business Portal</Link>
          </Button>
          {!isConnected ? (
            <Web3Button onClick={onConnect} glowing>
              Connect Wallet
            </Web3Button>
          ) : (
            <div className="flex items-center gap-4">
              {showSettings && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings">Settings</Link>
                </Button>
              )}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

