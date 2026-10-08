import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT, makeBrief, restoreDraft } from "./factoryWorkspace";

describe("Factory workspace", () => {
  it("recovers malformed drafts and limits persisted input", () => {
    expect(restoreDraft("invalid")).toEqual(EMPTY_DRAFT);
    expect(restoreDraft(JSON.stringify({ channel: "missing", title: "x".repeat(200), scenes: 5, aspect: "bad" }))).toEqual({ ...EMPTY_DRAFT, title: "x".repeat(120) });
  });
  it("preserves scene order and leaves chapter assignments for review", () => {
    const result = makeBrief({ ...EMPTY_DRAFT, title: "../Winter", scenes: "First scene\r\n\nSecond scene" });
    expect(result.assets.map((a) => a.suggested_filename)).toEqual(["01_winter.jpg", "02_winter.jpg"]);
    expect(result.assets[1].prompt).toContain("Second scene");
    expect(result.assets.every((a) => a.chapter === null && a.overlay === "none")).toBe(true);
  });
  it("uses the selected channel style and aspect", () => {
    const result = makeBrief({ channel: "relaxation", title: "Fireplace", scenes: "A glowing fire", aspect: "9:16" });
    expect(result.assets[0].prompt).toContain("seamless ambience loop");
    expect(result.assets[0].prompt).toContain("9:16");
  });
  it("refuses empty and oversized scene lists", () => {
    expect(() => makeBrief(EMPTY_DRAFT)).toThrow();
    expect(() => makeBrief({ ...EMPTY_DRAFT, title: "Test", scenes: " \n " })).toThrow();
    expect(() => makeBrief({ ...EMPTY_DRAFT, title: "Test", scenes: Array(41).fill("Scene").join("\n") })).toThrow();
  });
});
