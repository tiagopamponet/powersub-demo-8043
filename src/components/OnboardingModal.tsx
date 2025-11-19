"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const SEEN_KEY = "onboarding_seen_v1";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const force = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("onboarding") === "1" : false;
      const seen = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : "1";
      if (force || !seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener("open-onboarding", handler as any);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("open-onboarding", handler as any);
      }
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {}} />
      <div className="relative w-full max-w-2xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-xl px-6 sm:px-10 py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-gray-300">
          <p>
            Step <strong>1</strong>: Create or join a presale you like
          </p>
          <p>
            Step <strong>2</strong>: When the target is reached, a coin is deployed and airdropped to presale participants.
          </p>
          <p>
            Step <strong>3</strong>: Enjoy!
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              try { localStorage.setItem(SEEN_KEY, "1"); } catch {}
              setOpen(false);
            }}
            className="inline-flex items-center justify-center px-5 py-3 rounded bg-[var(--color-accent)] text-black font-medium w-full sm:w-auto"
          >
            I&apos;m ready to launch
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-4">
          <Link href="#">Privacy policy</Link>
          <Link href="#">Terms of service</Link>
          <Link href="#">Fees</Link>
        </div>
      </div>
    </div>
  );
}


