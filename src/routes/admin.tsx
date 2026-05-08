import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — AAsamachar" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const [form, setForm] = useState({
    title: "", summary: "", content: "", image_url: "",
    category: "local" as "local" | "national" | "international",
    region: "", source: "", source_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: articles } = useQuery({
    queryKey: ["admin", "articles"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("id,title,category,published_at").order("published_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold">Admin only</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your account isn't an admin yet.</p>
      {user && (
        <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-left text-xs">
          <p className="text-muted-foreground">Make yourself admin by running this in your backend (one time):</p>
          <pre className="mt-2 overflow-auto"><code>{`INSERT INTO public.user_roles (user_id, role)\nVALUES ('${user.id}', 'admin');`}</code></pre>
        </div>
      )}
    </div>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("articles").insert({
      ...form,
      image_url: form.image_url || null,
      region: form.region || null,
      source: form.source || null,
      source_url: form.source_url || null,
      author_id: user!.id,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Article published");
    setForm({ title: "", summary: "", content: "", image_url: "", category: form.category, region: "", source: "", source_url: "" });
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["articles"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin"] });
    qc.invalidateQueries({ queryKey: ["articles"] });
  };

  const input = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 grid lg:grid-cols-5 gap-8">
      <form onSubmit={submit} className="lg:col-span-3 space-y-3 rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight mb-2">Publish a story</h1>
        <input className={input} placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className={input} placeholder="Summary (1-2 sentences)" required rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <textarea className={input} placeholder="Full article content" required rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover image</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const ext = file.name.split(".").pop();
                const path = `${user!.id}/${Date.now()}.${ext}`;
                const { error: upErr } = await supabase.storage.from("article-images").upload(path, file, { cacheControl: "3600", upsert: false });
                if (upErr) { toast.error(upErr.message); setUploading(false); return; }
                const { data } = supabase.storage.from("article-images").getPublicUrl(path);
                setForm((f) => ({ ...f, image_url: data.publicUrl }));
                setUploading(false);
                toast.success("Image uploaded");
              }}
              className="text-sm"
            />
            {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
          </div>
          {form.image_url && (
            <div className="flex items-center gap-3">
              <img src={form.image_url} alt="preview" className="h-20 w-32 rounded-md object-cover border border-border" />
              <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-destructive hover:underline">Remove</button>
            </div>
          )}
          <input className={input} placeholder="…or paste an image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
            <option value="local">Local</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </select>
          <input className={input} placeholder="Region (optional)" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          <input className={input} placeholder="Source name (optional)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input className={input} placeholder="Source URL (optional)" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
        </div>
        <button disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {submitting ? "Publishing…" : "Publish"}
        </button>
      </form>
      <aside className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold mb-3">Recent</h2>
        <ul className="space-y-2 max-h-[600px] overflow-auto">
          {(articles ?? []).map((a: any) => (
            <li key={a.id} className="flex items-start justify-between gap-2 rounded-lg p-2 hover:bg-accent">
              <div>
                <p className="text-sm font-medium leading-tight">{a.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{a.category} · {new Date(a.published_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => remove(a.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {!articles?.length && <p className="text-sm text-muted-foreground">No articles yet.</p>}
        </ul>
      </aside>
    </div>
  );
}
