"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Rocket, Image as ImageIcon, Timer, Globe, MessageCircle, Twitter, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required").max(10, "Symbol too long"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().optional(),
  twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  telegram: z.string().url("Invalid Telegram URL").optional().or(z.literal("")),
  website: z.string().url("Invalid Website URL").optional().or(z.literal("")),
  durationMinutes: z.number().int().min(30, "Minimum 30 minutes").max(720, "Maximum 12 hours"),
});

export default function NewPresalePage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    
    try {
      if (!publicKey) throw new Error("Please connect your wallet first.");
      
      const rawData = {
        tokenName: String(formData.get("tokenName") || ""),
        tokenSymbol: String(formData.get("tokenSymbol") || ""),
        imageUrl: String(formData.get("imageUrl") || ""),
        description: String(formData.get("description") || ""),
        twitter: String(formData.get("twitter") || ""),
        telegram: String(formData.get("telegram") || ""),
        website: String(formData.get("website") || ""),
        durationMinutes: Number(formData.get("durationMinutes") || 30),
      };

      const validatedData = schema.parse(rawData);

      const res = await fetch("/api/presales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validatedData, creator: publicKey.toBase58() }),
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || "Failed to create presale");
      }
      
      const created = await res.json();
      router.push(`/presales/${created.id}`);
      
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        // Explicitly cast to any to avoid type issues with some Zod versions in strict mode
        const issues = (e as any).errors || (e as any).issues;
        setError(issues?.[0]?.message || "Validation error");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create New Presale</h1>
        <p className="mt-2 text-zinc-400">Launch your token presale in minutes. Secure, automated, and transparent.</p>
      </div>

      {!publicKey ? (
        <Card className="bg-zinc-900/50 border-zinc-800 text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Connect Wallet Required</h3>
              <p className="text-zinc-400 max-w-xs mx-auto mt-1">Please connect your Solana wallet to initiate a new presale.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <Card className="bg-zinc-900/50 border-zinc-800">
              <form action={onSubmit}>
                <CardHeader>
                  <CardTitle>Token Details</CardTitle>
                  <CardDescription>Enter the basic information about your token.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Token Identity */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenName">Token Name</Label>
                      <Input id="tokenName" name="tokenName" placeholder="e.g. Super Doge" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tokenSymbol">Token Symbol</Label>
                      <Input id="tokenSymbol" name="tokenSymbol" placeholder="e.g. SDOGE" required />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Tell potential investors about your project..." className="min-h-[100px]" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Logo URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="imageUrl" 
                        name="imageUrl" 
                        placeholder="https://..." 
                        required 
                        onChange={(e) => setPreviewImg(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">Direct link to image (PNG/JPG/GIF). Square aspect ratio recommended.</p>
                  </div>

                  <Separator className="bg-zinc-800" />

                  {/* Presale Settings */}
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Presale Settings
                    </h3>
                    <div className="grid gap-2">
                      <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                      <Input 
                        id="durationMinutes" 
                        name="durationMinutes" 
                        type="number" 
                        min={30} 
                        max={720} 
                        defaultValue={30} 
                        required 
                      />
                      <p className="text-xs text-zinc-500">Between 30 and 720 minutes (12 hours).</p>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />

                  {/* Social Links */}
                  <div>
                    <h3 className="mb-4 text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Social Links <span className="text-xs font-normal text-zinc-600">(Optional)</span>
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                         <Label htmlFor="website" className="flex items-center gap-2"><Globe className="h-3 w-3"/> Website</Label>
                         <Input id="website" name="website" placeholder="https://yourproject.com" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                           <Label htmlFor="twitter" className="flex items-center gap-2"><Twitter className="h-3 w-3"/> Twitter</Label>
                           <Input id="twitter" name="twitter" placeholder="https://x.com/..." />
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="telegram" className="flex items-center gap-2"><MessageCircle className="h-3 w-3"/> Telegram</Label>
                           <Input id="telegram" name="telegram" placeholder="https://t.me/..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-500/15 p-3 text-sm text-red-500 flex items-start gap-2 border border-red-500/20">
                       <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                       {error}
                    </div>
                  )}
                  
                </CardContent>
                <CardFooter className="flex justify-end border-t border-zinc-800 pt-6">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                    {loading ? (
                      <>Creating Presale...</>
                    ) : (
                      <><Rocket className="mr-2 h-4 w-4" /> Launch Presale</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="hidden lg:block space-y-4">
             <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Preview</h3>
             <Card className="overflow-hidden border-zinc-800 bg-zinc-900/30">
               <div className="aspect-video w-full bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                 {previewImg ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={previewImg} alt="Preview" className="h-full w-full object-cover" onError={() => setPreviewImg(null)} />
                 ) : (
                   <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Logo Preview</span>
                   </div>
                 )}
               </div>
               <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="h-6 w-2/3 bg-zinc-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs text-zinc-500">
                        <span>Progress</span>
                        <span>0%</span>
                     </div>
                     <div className="h-2 w-full bg-zinc-800 rounded-full"></div>
                  </div>
               </CardContent>
             </Card>
             
             <div className="rounded-lg border border-blue-900/30 bg-blue-900/10 p-4 text-sm text-blue-200">
               <div className="flex items-center gap-2 font-semibold text-blue-400 mb-2">
                 <Info className="h-4 w-4" /> Note
               </div>
               Once created, a unique wallet address will be generated for your presale. Funds are automatically managed by the platform.
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
