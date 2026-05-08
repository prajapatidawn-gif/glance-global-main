import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, Search, Bookmark, LogOut, PenSquare } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const links = [
  { to: "/", label: "Today" },
  { to: "/local", label: "Local" },
  { to: "/national", label: "National" },
  { to: "/international", label: "International" },
] as const;

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="AAsamachar home">
            <span aria-hidden="true" className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-2 font-display text-sm font-bold tracking-tighter text-primary-foreground">
              AA
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              <span className="text-primary">AA</span>samachar
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }}
                activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } }); }}
            className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 w-56">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics..."
              className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
          </form>
          <div className="flex items-center gap-1">
            {user && (
              <Link to="/bookmarks" className="p-2 rounded-full hover:bg-accent" aria-label="Bookmarks">
                <Bookmark className="h-4 w-4" />
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="p-2 rounded-full hover:bg-accent" aria-label="Admin">
                <PenSquare className="h-4 w-4" />
              </Link>
            )}
            <button onClick={toggle} className="p-2 rounded-full hover:bg-accent" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {user ? (
              <button onClick={() => signOut()} className="p-2 rounded-full hover:bg-accent" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link to="/auth" className="ml-1 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                Sign in
              </Link>
            )}
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-1 pb-2 -mx-1 overflow-x-auto">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className="px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground"
              activeProps={{ className: "px-3 py-1.5 text-sm whitespace-nowrap text-foreground font-semibold" }}
              activeOptions={{ exact: true }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
