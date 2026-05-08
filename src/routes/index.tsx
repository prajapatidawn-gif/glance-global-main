import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArticleGrid } from "@/components/ArticleGrid";
import type { Article } from "@/components/ArticleCard";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Today — AAsamachar" }, { name: "description", content: "Today's top stories from around your city, your country, and the world." }] }),
});

function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["articles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("published", true).order("published_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data as Article[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <section className="mb-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          The day in <span className="italic">stories</span>.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">A clear, calm read of what matters — close to home and across the world.</p>
      </section>
      <ArticleGrid articles={data ?? []} loading={isLoading} featuredFirst />
    </div>
  );
}
