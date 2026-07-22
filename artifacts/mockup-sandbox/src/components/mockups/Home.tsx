import { Leaf, LogOut } from "lucide-react";
import type { PublicUser } from "@/lib/auth-db";
import { logOut } from "@/lib/auth-db";

type HomeProps = {
  user: PublicUser;
  onLogout: () => void;
};

export default function Home({ user, onLogout }: HomeProps) {
  const handleLogout = async () => {
    await logOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#f3f5f1] font-sans">
      <header className="flex items-center justify-between border-b border-[#d7ddd2] bg-white/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a2a1f]">
            <Leaf className="h-4 w-4 text-[#b7d4a4]" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold tracking-tight text-[#152019]">
            BioChar
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-[#667566] sm:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-[#c9d2c4] bg-white px-3 py-2 text-sm font-medium text-[#2c3a2f] transition hover:bg-[#eef2ea]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-start px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-[#152019]">
          Workspace
        </h1>
        <p className="mt-2 text-[15px] text-[#667566]">
          More screens will appear here as we build the product.
        </p>
      </main>
    </div>
  );
}
