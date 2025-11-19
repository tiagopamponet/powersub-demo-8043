"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink, Rocket, ShieldCheck, Wallet, Clock, ArrowRight, AlertCircle, Globe } from "lucide-react";
import { toast } from "sonner"; // Assuming toast library, but I'll make a minimal implementation if needed or just use alerts for now

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PresaleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, mutate } = useSWR(id ? `/api/presales/${id}` : null, fetcher);
  const { data: contribs, mutate: mutateContribs } = useSWR(id ? `/api/presales/${id}/contributions` : null, fetcher);
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const presaleWallet = useMemo(() => (data ? new PublicKey(data.walletPublicKey) : null), [data]);
  
  const isClosed = useMemo(() => {
    const end = data?.closeAt || 0;
    return end > 0 && Date.now() >= end;
  }, [data?.closeAt]);
  
  const progressPct = useMemo(() => {
    if (!data) return 0;
    const capLamports = data.maxSol * 1_000_000_000;
    return Math.min(100, Math.round(((data.raisedLamports || 0) / capLamports) * 100));
  }, [data]);

  const solscanUrl = useMemo(() => {
    const addr = data?.walletPublicKey;
    if (!addr) return "#";
    const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "devnet";
    const suffix = cluster && cluster !== "mainnet-beta" ? `?cluster=${cluster}` : "";
    return `https://solscan.io/account/${addr}${suffix}`;
  }, [data?.walletPublicKey]);

  const [now, setNow] = useState(Date.now());
  useMemo(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeLeft = useMemo(() => {
    const end = data?.closeAt || 0;
    if (!end) return null;
    const ms = Math.max(0, end - now);
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }, [data?.closeAt, now]);

  async function contribute() {
    try {
      setError(null);
      setLoading(true);
      if (!publicKey || !presaleWallet) throw new Error("Please connect your wallet first");
      if (amount <= 0) throw new Error("Please enter a valid amount");

      const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: presaleWallet, lamports: Math.round(amount * LAMPORTS_PER_SOL) })
      );
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      
      const signature = await sendTransaction(tx, connection, { minContextSlot: 0 });
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      
      const res = await fetch(`/api/presales/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributor: publicKey.toBase58(), amountSol: amount, signature }),
      });
      
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to register contribution");
      
      if (payload?.newRaisedLamports) {
        mutate((prev: any) => (prev ? { ...prev, raisedLamports: payload.newRaisedLamports } : prev), false);
      } else {
        mutate();
      }
      mutateContribs();
      setAmount(0);
      setSuccess("Successfully contributed to presale!");
      setTimeout(() => setSuccess(null), 5000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const raisedSol = (data.raisedLamports || 0) / 1_000_000_000;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
             {data.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.imageUrl} alt={data.tokenName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-bold text-zinc-600">
                  {data.tokenSymbol.slice(0, 2)}
                </div>
              )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{data.tokenName}</h1>
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="font-semibold text-emerald-400">{data.tokenSymbol}</span>
              <span>•</span>
              <a href={solscanUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                 {data.walletPublicKey.slice(0, 4)}...{data.walletPublicKey.slice(-4)} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2 pt-2">
               {data.website && (
                 <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                   <a href={data.website} target="_blank" rel="noopener noreferrer"><Globe className="h-3 w-3"/> Website</a>
                 </Button>
               )}
                {/* Add other social links if available in schema */}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {isClosed ? (
              <Badge variant="secondary" className="h-9 px-4 text-sm">Presale Ended</Badge>
           ) : (
              <Badge variant="success" className="h-9 px-4 text-sm animate-pulse"><span className="relative flex h-2 w-2 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Live Now</Badge>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Card */}
          <Card>
            <CardHeader>
              <CardTitle>About Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {data.description || "No description provided for this project."}
              </p>
            </CardContent>
          </Card>

           {/* Contributors List */}
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-zinc-500" /> Recent Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
                {contribs && contribs.length > 0 ? (
                  <div className="divide-y divide-zinc-800">
                    {contribs.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 text-sm">
                        <div className="flex items-center gap-3">
                           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
                             <Wallet className="h-4 w-4" />
                           </div>
                           <div className="flex flex-col">
                             <span className="font-medium text-zinc-300">{c.contributor.slice(0, 6)}...{c.contributor.slice(-6)}</span>
                             <span className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleString()}</span>
                           </div>
                        </div>
                        <div className="font-mono font-medium text-emerald-400">
                          +{(c.amountLamports / 1_000_000_000).toFixed(2)} SOL
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500">No contributions yet. Be the first!</div>
                )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
           {/* Contribution Card */}
           <Card className="border-emerald-500/20 bg-zinc-900/80 shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-500/10">
             <CardHeader>
               <CardTitle>Contribute</CardTitle>
               <CardDescription>Join the presale securely</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
               
               {/* Progress Section */}
               <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Raised</span>
                    <span className="font-medium text-white">{raisedSol.toFixed(2)} / {data.maxSol} SOL</span>
                 </div>
                 <Progress value={progressPct} className="h-3" />
                 <div className="flex justify-between text-xs text-zinc-500">
                   <span>{progressPct}% Filled</span>
                   <span>Hard Cap</span>
                 </div>
               </div>

               <Separator />

               {/* Input Section */}
               {!isClosed ? (
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-300">Amount (SOL)</label>
                     <div className="relative">
                       <Input 
                          type="number" 
                          placeholder="0.0"
                          min="0"
                          step="0.1"
                          value={amount || ''}
                          onChange={(e) => setAmount(parseFloat(e.target.value))}
                          disabled={loading}
                          className="pr-16 text-lg font-mono"
                       />
                       <div className="absolute right-3 top-2.5 text-sm font-semibold text-zinc-500">SOL</div>
                     </div>
                   </div>

                   {error && (
                     <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                       <AlertCircle className="h-4 w-4 shrink-0" />
                       {error}
                     </div>
                   )}

                    {success && (
                     <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-500">
                       <ShieldCheck className="h-4 w-4 shrink-0" />
                       {success}
                     </div>
                   )}

                   <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-12 text-base" 
                    onClick={contribute}
                    disabled={loading || !publicKey}
                   >
                     {loading ? (
                        <>Processing...</> 
                     ) : !publicKey ? (
                        <>Connect Wallet to Buy</>
                     ) : (
                        <>Buy ${data.tokenSymbol}</>
                     )}
                   </Button>
                   
                   {!publicKey && <p className="text-center text-xs text-zinc-500">You must confirm the transaction in your wallet.</p>}
                 </div>
               ) : (
                 <div className="rounded-lg bg-zinc-800 p-4 text-center">
                   <p className="font-semibold text-zinc-300">Presale Ended</p>
                   <p className="text-sm text-zinc-500">Contributions are no longer accepted.</p>
                 </div>
               )}

             </CardContent>
             <CardFooter className="flex flex-col gap-3 bg-zinc-900/50 p-4 text-xs text-zinc-500">
               <div className="flex w-full items-center justify-between">
                 <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Ends In</span>
                 <span className="font-mono text-zinc-300">{isClosed ? "Ended" : timeLeft}</span>
               </div>
               <div className="flex w-full items-center justify-between">
                 <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Status</span>
                 <span className="font-medium text-emerald-500">Verified</span>
               </div>
             </CardFooter>
           </Card>

           {/* Presale Details Sidebar Info */}
           <Card>
             <CardHeader className="pb-3">
                <CardTitle className="text-base">Token Info</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-4 text-sm">
               <div className="flex justify-between border-b border-zinc-800 pb-2">
                 <span className="text-zinc-500">Token Name</span>
                 <span className="font-medium text-zinc-200">{data.tokenName}</span>
               </div>
               <div className="flex justify-between border-b border-zinc-800 pb-2">
                 <span className="text-zinc-500">Symbol</span>
                 <span className="font-medium text-zinc-200">{data.tokenSymbol}</span>
               </div>
               <div className="flex justify-between items-center pt-1">
                 <span className="text-zinc-500">Presale Address</span>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(data.walletPublicKey)}>
                   <Copy className="h-3 w-3 text-zinc-400" />
                 </Button>
               </div>
               <code className="rounded bg-zinc-950 p-2 text-xs text-zinc-400 break-all">
                 {data.walletPublicKey}
               </code>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
