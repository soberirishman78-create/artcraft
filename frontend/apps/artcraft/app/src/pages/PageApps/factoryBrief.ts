export const FACTORY_CHANNELS = [
  { id: "talefold", name: "TaleFold Classics", style: "Cinematic storybook illustration. Consistent character appearance, period clothing and locations. No lettering in the artwork.", purpose: "Illustrated audiobook scenes and covers" },
  { id: "relaxation", name: "Relaxation Station Loops", style: "Calm, natural lighting with gentle movement. Stable camera and composition suitable for a seamless ambience loop. No sudden flashes or lettering.", purpose: "Campfires, fireplaces, nature and space ambience" },
  { id: "sidequest", name: "Side Quest Central", style: "Bold, readable gaming artwork with one clear focal point and room for a short title. Preserve the actual game's visual identity; avoid misleading gameplay claims.", purpose: "Gaming thumbnails, title cards and episode visuals" },
] as const;

export type WorkspaceDraft = {
  channel: string;
  title: string;
  aspect: "16:9" | "9:16";
  scenes: string;
};

export const EMPTY_DRAFT: WorkspaceDraft = {
  channel: "talefold", title: "", aspect: "16:9", scenes: "",
};

export function restoreDraft(raw: string | null): WorkspaceDraft {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return { ...EMPTY_DRAFT };
    return {
      channel: FACTORY_CHANNELS.some((c) => c.id === value.channel) ? value.channel : "talefold",
      title: typeof value.title === "string" ? value.title.slice(0, 120) : "",
      aspect: value.aspect === "9:16" ? "9:16" : "16:9",
      scenes: typeof value.scenes === "string" ? value.scenes.slice(0, 12000) : "",
    };
  } catch {
    return { ...EMPTY_DRAFT };
  }
}

export function makeBrief(draft: WorkspaceDraft) {
  const channel = FACTORY_CHANNELS.find((c) => c.id === draft.channel);
  const scenes = draft.scenes.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!channel || !draft.title.trim()) throw new Error("Choose a channel and enter a project title.");
  if (!scenes.length || scenes.length > 40) throw new Error("Add between 1 and 40 scenes, one per line.");
  if (draft.title.length > 120 || draft.scenes.length > 12000) throw new Error("Shorten the project title or scene notes.");
  if (!["16:9", "9:16"].includes(draft.aspect)) throw new Error("Choose wide or vertical artwork.");
  const slug = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "project";
  const assets = scenes.map((scene, index) => ({
    number: index + 1,
    suggested_filename: `${String(index + 1).padStart(2, "0")}_${slug}.jpg`,
    prompt: `${draft.title.trim()} — scene ${index + 1}: ${scene}\n${channel.style}\nAspect ratio: ${draft.aspect}.`,
    chapter: null,
    overlay: "none",
  }));
  return {
    version: 1,
    title: draft.title.trim(),
    channel: channel.name,
    aspect: draft.aspect,
    assets,
    handoff: "Generate and review the artwork in ArtCraft, then export images to Ambience Factory. This brief does not generate, upload or queue media. Assign chapter pins and overlays before building a book package.",
  };
}
