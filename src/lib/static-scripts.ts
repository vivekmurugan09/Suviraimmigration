import type { StaticPageScript } from "@/content/types";

/**
 * Replays the original site's scripts in DOM order: external files load
 * sequentially, inline scripts execute synchronously after the ones before
 * them — mirroring how the source HTML executed them at parse time.
 */

let shimInstalled = false;

/**
 * Injected scripts run after DOMContentLoaded has already fired, so listeners
 * registered for it inside the original inline scripts would never fire.
 * Patch addEventListener (once) to invoke those listeners immediately.
 */
function installDomReadyShim() {
  if (shimInstalled || typeof document === "undefined") return;
  shimInstalled = true;
  const nativeAdd = document.addEventListener.bind(document);
  const fireNow = (fn: EventListenerOrEventListenerObject) => {
    Promise.resolve().then(() => {
      if (typeof fn === "function") fn(new Event("DOMContentLoaded"));
      else (fn as EventListenerObject).handleEvent(new Event("DOMContentLoaded"));
    });
  };
  document.addEventListener = function patched(
    type: string,
    fn: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === "DOMContentLoaded" && document.readyState !== "loading") {
      fireNow(fn);
      return;
    }
    return nativeAdd(type, fn, options);
  } as typeof document.addEventListener;
}

export async function runPageScripts(scripts: StaticPageScript[], signal?: AbortSignal) {
  installDomReadyShim();
  for (const script of scripts) {
    if (signal?.aborted) return;
    if (script.src) {
      const src = script.src;
      await new Promise<void>((resolve) => {
        const el = document.createElement("script");
        el.src = src;
        if (script.type) el.type = script.type;
        el.onload = () => resolve();
        el.onerror = () => resolve();
        signal?.addEventListener('abort', () => { el.remove(); resolve(); }, { once: true });
        document.body.appendChild(el);
      });
    } else if (script.inline) {
      const el = document.createElement("script");
      el.text = script.inline;
      if (script.type) el.type = script.type;
      document.body.appendChild(el);
      signal?.addEventListener('abort', () => el.remove(), { once: true });
    }
  }
}
