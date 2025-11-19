import { redis } from "@/lib/redis";
import type { Presale } from "@/lib/types";
import { PresaleCard } from "@/components/presale/PresaleCard";
import { Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ids = await redis.zrange("presales:index", 0, -1);
  const rows = await Promise.all(ids.map((id) => redis.hgetall<Presale>(`presales:${id}`)));
  const data = rows
    .filter(Boolean)
    .map((p) => {
      const { walletSealedSecret, ...pub } = p as Presale & { walletSealedSecret?: string };
      return pub;
    })
    .reverse(); // Show newest first

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950/0 to-zinc-950/0 opacity-50 blur-3xl" />
        
        <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 backdrop-blur-sm">
          <Zap className="mr-1 h-3 w-3 fill-current" /> The Fastest Way to Launch on Solana
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Launch Your Token <br />
          <span className="text-gradient">With Confidence</span>
        </h1>
        
        <p className="max-w-2xl text-lg text-zinc-400">
          Create and participate in secure Solana presales. Automated wallets, instant distribution, and transparent tracking.
        </p>
        
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold">
            <Link href="/presales/new">
              <Rocket className="mr-2 h-4 w-4" /> Create Presale
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
            <Link href="/how-it-works">How it Works</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section (Optional placeholder) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Presales", value: data.length },
          { label: "Total Raised", value: `${data.reduce((acc, p) => acc + (p.raisedLamports || 0), 0) / 1e9} SOL` },
          { label: "Active Now", value: data.filter(p => new Date(p.closeAt) > new Date()).length }
        ].map((stat, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Presales Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Active Presales</h2>
          {/* Future: Add Filter/Sort dropdowns here */}
        </div>

        {data.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 text-zinc-500">
            <p className="mb-4">No presales active right now.</p>
            <Button asChild variant="outline">
              <Link href="/presales/new">Be the first to launch</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((presale) => (
              <PresaleCard key={presale.id} presale={presale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
