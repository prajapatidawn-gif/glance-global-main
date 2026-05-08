import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Article = {
  id: string;
  title: string;
  summary: string;
  image_url: string | null;
  category: "local" | "national" | "international";
  region: string | null;
  source: string | null;
  published_at: string;
};

const categoryColor: Record<Article["category"], string> = {
  local: "bg-[color:var(--color-local)]/15 text-[color:var(--color-local)]",
  national: "bg-[color:var(--color-national)]/15 text-[color:var(--color-national)]",
  international: "bg-[color:var(--color-international)]/15 text-[color:var(--color-international)]",
};

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: bookmarked } = useQuery({
    queryKey: ["bookmark", article.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.from("bookmarks").select("id").eq("article_id", article.id).eq("user_id", user.id).maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to save articles"); return; }
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("article_id", article.id).eq("user_id", user.id);
      toast.success("Removed from bookmarks");
    } else {
      await supabase.from("bookmarks").insert({ article_id: article.id, user_id: user.id });
      toast.success("Saved");
    }
    qc.invalidateQueries({ queryKey: ["bookmark", article.id] });
    qc.invalidateQueries({ queryKey: ["bookmarks"] });
  };

  const date = new Date(article.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <Link to="/article/$id" params={{ id: article.id }}
      className={`group fade-in card-hover block overflow-hidden rounded-2xl border border-border bg-card ${featured ? "md:col-span-2 md:row-span-2" : ""}`}>
      {article.image_url && (
        <div className={`overflow-hidden ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
          <img src={article.image_url} alt={article.title} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${categoryColor[article.category]}`}>
            {article.category}
          </span>
          <button onClick={toggleBookmark} className="p-1.5 rounded-full hover:bg-accent" aria-label="Bookmark">
            {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        <h3 className={`font-display font-semibold leading-tight text-card-foreground group-hover:text-primary/90 transition-colors ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          {article.source && <span className="font-medium">{article.source}</span>}
          {article.source && <span>·</span>}
          <span>{date}</span>
          {article.region && <><span>·</span><span>{article.region}</span></>}
        </div>
      </div>
    </Link>
  );
}

export function ArticleSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${featured ? "md:col-span-2" : ""}`}>
      <div className={`skeleton ${featured ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
