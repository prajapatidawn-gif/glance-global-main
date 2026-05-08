import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/article/$id")({
  head: () => ({ meta: [{ title: "Article — AAsamachar" }] }),
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-6 py-20"><div className="skeleton h-8 w-2/3 rounded mb-4" /><div className="skeleton h-64 w-full rounded mb-6" /><div className="skeleton h-4 w-full rounded mb-2" /><div className="skeleton h-4 w-full rounded mb-2" /><div className="skeleton h-4 w-3/4 rounded" /></div>;
  if (!data) return <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted-foreground">Article not found.</div>;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 fade-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{data.category}{data.region ? ` · ${data.region}` : ""}</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">{data.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{data.summary}</p>
      <div className="mt-3 text-sm text-muted-foreground">
        {data.source && <span className="font-medium text-foreground">{data.source}</span>}
        {data.source && " · "}
        {new Date(data.published_at).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
      </div>
      {data.image_url && <img src={data.image_url} alt={data.title} className="mt-8 w-full rounded-2xl aspect-[16/9] object-cover" />}
      <div className="mt-8 prose prose-lg max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed font-[450]">
        {data.content}
      </div>
      {data.source_url && (
        <a href={data.source_url} target="_blank" rel="noreferrer"
          className="mt-8 inline-block text-sm text-primary underline underline-offset-4">Read original source →</a>
      )}
    </article>
  );
}
