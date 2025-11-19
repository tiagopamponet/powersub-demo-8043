export const metadata = { title: "How It Works" };

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-lg px-6 sm:px-10 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">How It Works</h1>
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
          <Link href="/" className="inline-flex items-center justify-center px-5 py-3 rounded bg-[var(--color-accent)] text-black font-medium">
            I&apos;m ready to launch
          </Link>
        </div>
      </div>
    </div>
  );
}

