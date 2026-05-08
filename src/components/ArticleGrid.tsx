import { ArticleCard, ArticleSkeleton, type Article } from "./ArticleCard";

export function ArticleGrid({ articles, loading, featuredFirst = false }: { articles: Article[]; loading?: boolean; featuredFirst?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} featured={featuredFirst && i === 0} />)}
      </div>
    );
  }
  if (!articles.length) {
    return <div className="text-center py-20 text-muted-foreground">No articles yet.</div>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {articles.map((a, i) => <ArticleCard key={a.id} article={a} featured={featuredFirst && i === 0} />)}
    </div>
  );
}
