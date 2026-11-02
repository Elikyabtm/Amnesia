"use client";

import { useEffect, type RefObject } from "react";

// Surlignage d'un passage de texte sans toucher au DOM géré par React, grâce à
// l'API CSS Custom Highlight (::highlight(clue-highlight) dans globals.css).
// Si le navigateur ne la gère pas, on se contente de faire défiler jusqu'au passage.

const HIGHLIGHT_NAME = "clue-highlight";
const rangesByOwner = new Map<string, Range[]>();

type HighlightRegistry = { set: (name: string, h: unknown) => void; delete: (name: string) => void };

function supportsHighlights() {
  return typeof CSS !== "undefined" && "highlights" in CSS && typeof (globalThis as { Highlight?: unknown }).Highlight === "function";
}

// Le parseur CSS du build ne connaît pas encore ::highlight(), on injecte donc la règle à l'exécution
function ensureStyle() {
  if (document.getElementById("clue-highlight-style")) return;
  const style = document.createElement("style");
  style.id = "clue-highlight-style";
  style.textContent = `::highlight(${HIGHLIGHT_NAME}) { background-color: #fde047; color: #111827; }`;
  document.head.appendChild(style);
}

function syncRegistry() {
  if (!supportsHighlights()) return;
  ensureStyle();
  const registry = (CSS as unknown as { highlights: HighlightRegistry }).highlights;
  const all = [...rangesByOwner.values()].flat();
  if (all.length === 0) {
    registry.delete(HIGHLIGHT_NAME);
    return;
  }
  const HighlightCtor = (globalThis as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
  registry.set(HIGHLIGHT_NAME, new HighlightCtor(...all));
}

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ");

/** Cherche `text` (insensible à la casse et aux espaces) dans `root`, même à cheval sur plusieurs nœuds. */
function findRange(root: HTMLElement, text: string): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let full = "";
  const starts: number[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n as Text;
    starts.push(full.length);
    nodes.push(t);
    full += t.data;
  }
  // Index normalisé -> index réel
  const map: number[] = [];
  let norm = "";
  for (let i = 0; i < full.length; i++) {
    const c = full[i];
    if (/\s/.test(c)) {
      if (norm.endsWith(" ")) continue;
      norm += " ";
    } else {
      norm += c.toLowerCase();
    }
    map.push(i);
  }
  const idx = norm.indexOf(normalize(text));
  if (idx < 0) return null;
  const startReal = map[idx];
  const endReal = map[idx + normalize(text).length - 1] + 1;

  const locate = (pos: number, isEnd: boolean) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (starts[i] < pos || (!isEnd && starts[i] === pos)) {
        return { node: nodes[i], offset: pos - starts[i] };
      }
    }
    return { node: nodes[0], offset: 0 };
  };
  const s = locate(startReal, false);
  const e = locate(endReal, true);
  const range = document.createRange();
  range.setStart(s.node, Math.min(s.offset, s.node.length));
  range.setEnd(e.node, Math.min(e.offset, e.node.length));
  return range;
}

/**
 * Surligne `text` dans le conteneur et le fait défiler à l'écran.
 * Réessaie pendant quelques secondes le temps que le contenu s'affiche.
 */
export function useTextHighlight(
  containerRef: RefObject<HTMLElement | null>,
  text: string | string[] | undefined,
  ownerId: string,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!text) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let giveUp: ReturnType<typeof setTimeout> | null = null;

    const tryHighlight = () => {
      const root = containerRef.current;
      if (!root || cancelled) return false;
      const candidates = Array.isArray(text) ? text : [text];
      let range: Range | null = null;
      for (const candidate of candidates) {
        range = findRange(root, candidate);
        if (range) break;
      }
      if (!range) return false;
      rangesByOwner.set(ownerId, [range]);
      syncRegistry();
      const el = range.startContainer.parentElement;
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      return true;
    };

    const start = setTimeout(() => {
      if (tryHighlight()) return;
      const root = containerRef.current;
      if (!root) return;
      observer = new MutationObserver(() => {
        if (tryHighlight()) observer?.disconnect();
      });
      observer.observe(root, { childList: true, subtree: true, characterData: true });
      giveUp = setTimeout(() => observer?.disconnect(), 4000);
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(start);
      if (giveUp) clearTimeout(giveUp);
      observer?.disconnect();
      rangesByOwner.delete(ownerId);
      syncRegistry();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(text) ? text.join("\u0000") : text, ownerId, ...deps]);
}
