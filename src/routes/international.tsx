import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleGrid } from "@/components/ArticleGrid";
import type { Article } from "@/components/ArticleCard";

export const Route = createFileRoute("/international")({
  head: () => ({ meta: [{ title: "International News — AAsamachar" }] }),
  component: function Intl() {
    const { data, isLoading } = useQuery({
      queryKey: ["articles", "international"],
      queryFn: async () => {
        const { data, error } = await supabase.from("articles").select("*").eq("published", true).eq("category", "international").order("published_at", { ascending: false }).limit(40);
        if (error) throw error;
        return data as Article[];
      },
    });
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">International</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight">Voices and events from around the world.</h1>
        </header>
        <ArticleGrid articles={data ?? []} loading={isLoading} />
      </div>
    );
  },
});
