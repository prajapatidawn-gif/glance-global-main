import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArticleGrid } from "@/components/ArticleGrid";
import type { Article } from "@/components/ArticleCard";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — AAsamachar" }] }),
  component: function Bookmarks() {
    const { user, loading } = useAuth();
    const { data, isLoading } = useQuery({
      queryKey: ["bookmarks", user?.id],
      enabled: !!user,
      queryFn: async () => {
        const { data, error } = await supabase.from("bookmarks").select("article_id, articles(*)").eq("user_id", user!.id).order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []).map((b: any) => b.articles).filter(Boolean) as Article[];
      },
    });
    if (!loading && !user) return <div className="mx-auto max-w-3xl px-6 py-20 text-center"><p className="text-muted-foreground">Sign in to view your saved stories.</p></div>;
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Your library</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">Bookmarks</h1>
        </header>
        <ArticleGrid articles={data ?? []} loading={isLoading} />
      </div>
    );
  },
});
