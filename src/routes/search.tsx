import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleGrid } from "@/components/ArticleGrid";
import type { Article } from "@/components/ArticleCard";
import { z } from "zod";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [{ title: "Search — AAsamachar" }] }),
  component: function SearchPage() {
    const { q } = Route.useSearch();
    const { data, isLoading } = useQuery({
      queryKey: ["search", q],
      enabled: !!q,
      queryFn: async () => {
        const { data, error } = await supabase.from("articles").select("*").eq("published", true)
          .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content.ilike.%${q}%`)
          .order("published_at", { ascending: false }).limit(50);
        if (error) throw error;
        return data as Article[];
      },
    });
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Search</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Results for "{q}"</h1>
        </header>
        <ArticleGrid articles={data ?? []} loading={isLoading} />
      </div>
    );
  },
});
