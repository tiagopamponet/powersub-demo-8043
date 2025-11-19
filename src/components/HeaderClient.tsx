"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

export default function HeaderClient() {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("open-onboarding"));
          }
        }}
        className="hidden sm:flex gap-2 text-zinc-400 hover:text-white"
      >
        <HelpCircle className="h-4 w-4" />
        How it works
      </Button>

      <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-semibold shadow-lg shadow-emerald-900/20">
        <Link href="/presales/new">
          <Plus className="mr-1 h-4 w-4" /> Create
        </Link>
      </Button>

      <div className="wallet-adapter-dropdown">
         <WalletMultiButton className="!bg-zinc-900 !h-9 !px-4 !text-sm !font-medium !text-zinc-200 !border !border-zinc-800 !rounded-md hover:!bg-zinc-800 hover:!text-white hover:!border-zinc-700 transition-all" />
      </div>
    </div>
  );
}
