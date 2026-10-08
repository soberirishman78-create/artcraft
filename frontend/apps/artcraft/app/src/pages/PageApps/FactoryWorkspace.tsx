import { useEffect, useMemo, useState } from "react";
import { FACTORY_CHANNELS, makeBrief, restoreDraft, type WorkspaceDraft } from "./factoryWorkspace";

const STORAGE_KEY = "ambience-factory.workspace.v1";
const FIELD_CLASS = "mt-2 w-full rounded border border-ui-border bg-ui-background p-3 text-base-fg";

export function FactoryWorkspace() {
  const [draft, setDraft] = useState<WorkspaceDraft>(() => {
    try { return restoreDraft(localStorage.getItem(STORAGE_KEY)); }
    catch { return restoreDraft(null); }
  });
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const result = useMemo(() => {
    try { return { brief: makeBrief(draft), error: "" }; }
    catch (error) { return { brief: null, error: (error as Error).message }; }
  }, [draft]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }
    catch { setStorageWarning("Draft saving is unavailable. Download your brief before closing."); }
  }, [draft]);
  const update = (value: Partial<WorkspaceDraft>) => { setDraft((old) => ({ ...old, ...value })); setNotice(""); };
  const prompt = result.brief?.assets.map((a) => a.prompt).join("\n\n") ?? "";

  return (
    <section aria-labelledby="factory-heading" className="mt-8 rounded border border-ui-border bg-white/5 p-5 sm:p-7">
      <p className="hud-label text-ui-accent-ink">Our studio</p>
      <h2 id="factory-heading" className="mt-2 text-2xl font-bold">Ambience Factory workspace</h2>
      <p className="mt-2 text-sm text-base-fg/70">Plan artwork for your channels here, create it with ArtCraft’s tools below, then export it to the factory.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {FACTORY_CHANNELS.map((channel) => (
          <button key={channel.id} type="button" aria-pressed={draft.channel === channel.id} onClick={() => update({ channel: channel.id })}
            className={`rounded border p-4 text-left ${draft.channel === channel.id ? "border-primary bg-primary/10" : "border-ui-border"}`}>
            <span className="block font-bold">{channel.name}</span>
            <span className="mt-2 block text-sm text-base-fg/70">{channel.purpose}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="sm:col-span-2">Project title
          <input className={FIELD_CLASS} value={draft.title} maxLength={120} onChange={(e) => update({ title: e.target.value })} placeholder="Book, ambience video or gaming episode" />
        </label>
        <label>Artwork shape
          <select className={FIELD_CLASS} value={draft.aspect} onChange={(e) => update({ aspect: e.target.value as WorkspaceDraft["aspect"] })}>
            <option value="16:9">Wide · 16:9</option><option value="9:16">Shorts · 9:16</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block">Scene notes — one scene per line, up to 40
        <textarea className={FIELD_CLASS} rows={4} maxLength={12000} value={draft.scenes} onChange={(e) => update({ scenes: e.target.value })} placeholder="Describe the characters, setting and action for each picture." />
      </label>
      <details className="mt-4"><summary className="cursor-pointer">Review generation prompts {result.brief ? `(${result.brief.assets.length})` : ""}</summary>
        <textarea aria-label="Generation prompts" readOnly rows={7} className={FIELD_CLASS} value={prompt} />
      </details>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={!result.brief} className="rounded border border-ui-border px-4 py-2 disabled:opacity-40" onClick={async () => {
          try { await navigator.clipboard.writeText(prompt); setNotice("Prompts copied. Paste them into your chosen creation tool."); }
          catch { setNotice("Clipboard unavailable. Select and copy the text under Review generation prompts."); }
        }}>Copy prompts</button>
        <button type="button" disabled={!result.brief} className="rounded border border-ui-border px-4 py-2 disabled:opacity-40" onClick={() => {
          if (!result.brief) return;
          const url = URL.createObjectURL(new Blob([JSON.stringify(result.brief, null, 2)], { type: "application/json" }));
          const link = document.createElement("a"); link.href = url; link.download = "factory-artwork-brief.json"; document.body.append(link); link.click(); link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Brief downloaded. Review and export your generated images separately.");
        }}>Download artwork brief</button>
      </div>
      <p role="status" className="mt-3 text-sm text-base-fg/70">{notice || result.error || "Draft saved on this device. No generation credits are spent by this workspace."}</p>
      {storageWarning && <p role="alert" className="mt-2 text-sm">{storageWarning}</p>}
      <p className="mt-3 text-xs text-base-fg/60">Personal customization of ArtCraft. Upstream services and license remain in place. AI generation still uses the selected provider and its account requirements.</p>
    </section>
  );
}
