import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Presale } from "@/lib/types";
import { ArrowRight, Clock, Users } from "lucide-react";

interface PresaleCardProps {
  presale: Omit<Presale, "walletSealedSecret">;
}

export function PresaleCard({ presale }: PresaleCardProps) {
  const raisedSol = (presale.raisedLamports || 0) / 1_000_000_000;
  const percentage = Math.min(100, Math.round((raisedSol / presale.maxSol) * 100));
  const isEnded = new Date(presale.closeAt) < new Date();

  return (
    <Card className="group overflow-hidden border-zinc-800 bg-zinc-900/50 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
          {presale.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={presale.imageUrl}
              alt={presale.tokenName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-4xl font-bold text-zinc-700">
              {presale.tokenSymbol.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute right-2 top-2">
            {isEnded ? (
              <Badge variant="secondary">Ended</Badge>
            ) : (
              <Badge variant="success" className="animate-pulse">
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              {presale.tokenName}
            </h3>
            <p className="text-sm font-medium text-zinc-400">{presale.tokenSymbol}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Progress</span>
              <span className="font-medium text-emerald-400">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>{raisedSol.toFixed(2)} SOL</span>
              <span>{presale.maxSol} SOL</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                <Users className="h-3 w-3" /> Creator
              </span>
              <span className="font-mono text-xs text-zinc-300 truncate" title={presale.creator}>
                {presale.creator.slice(0, 4)}...{presale.creator.slice(-4)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-500">
                <Clock className="h-3 w-3" /> Ends In
              </span>
              <span className="text-xs text-zinc-300">
                {isEnded ? "Ended" : new Date(presale.closeAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" size="lg">
          <Link href={`/presales/${presale.id}`}>
            View Presale <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
