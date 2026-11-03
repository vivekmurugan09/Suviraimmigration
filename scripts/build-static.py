#!/usr/bin/env python3
"""
Builds the static distribution directory (dist/) from the TanStack Start source
(src/content/pages/*.ts, src/assets/*, src/styles.css, src/lib/site-enhancements.ts,
src/routes/ai-preparation.tsx, and public/*) for Azure Static Web Apps deployment.
"""
import glob
import html
import json
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")

if os.path.exists(DIST):
    shutil.rmtree(DIST)
os.makedirs(DIST, exist_ok=True)

# 1. Copy public/* into dist/
public_dir = os.path.join(ROOT, "public")
for dirpath, dirnames, filenames in os.walk(public_dir):
    rel_dir = os.path.relpath(dirpath, public_dir)
    target_dir = DIST if rel_dir == "." else os.path.join(DIST, rel_dir)
    os.makedirs(target_dir, exist_ok=True)
    for fn in filenames:
        if fn == ".DS_Store":
            continue
        shutil.copy2(os.path.join(dirpath, fn), os.path.join(target_dir, fn))

# 2. Copy src/assets/* into dist/assets/
assets_src = os.path.join(ROOT, "src", "assets")
assets_dst = os.path.join(DIST, "assets")
os.makedirs(assets_dst, exist_ok=True)
for fn in os.listdir(assets_src):
    if fn == ".DS_Store":
        continue
    src_file = os.path.join(assets_src, fn)
    if os.path.isfile(src_file):
        shutil.copy2(src_file, os.path.join(assets_dst, fn))

# 3. Prepend :root design tokens and .suvira-ai-prep-fab rules from src/styles.css into dist/site-polish.css
root_tokens_css = """/* Root design tokens and AI Preparation FAB from src/styles.css */
:root {
  --site-ink: oklch(0.2 0.04 162);
  --site-muted: oklch(0.4 0.03 162);
  --site-soft: oklch(0.95 0.015 152);
  --site-surface: oklch(0.99 0.006 95);
  --site-action: oklch(0.42 0.11 162);
  --site-gold: oklch(0.74 0.13 82);
  --site-rose: oklch(0.48 0.08 158);
  --site-line: oklch(0.87 0.02 152);
  --site-shadow: 0 22px 48px -28px oklch(0.2 0.05 162 / 0.28);
  --site-success: oklch(0.46 0.12 155);
  --site-error: oklch(0.48 0.17 28);
  --site-hero-wash: linear-gradient(96deg, oklch(0.985 0.008 95 / 0.96) 0%, oklch(0.97 0.015 150 / 0.9) 55%, oklch(0.96 0.02 152 / 0.72) 100%);
  --site-photo-ink: oklch(0.985 0.008 95);
  --site-photo-muted: oklch(0.9 0.02 150);
  --site-photo-scrim: oklch(0.18 0.04 162 / 0.62);
  --site-photo-chip: oklch(0.2 0.04 162 / 0.56);
  --site-photo-chip-border: oklch(0.98 0.01 95 / 0.26);
  --site-photo-shadow: 0 2px 22px oklch(0.14 0.04 162 / 0.52);
  --background: oklch(0.99 0.006 95);
  --foreground: oklch(0.2 0.04 162);
  --card: oklch(0.99 0.006 95);
  --card-foreground: oklch(0.2 0.04 162);
  --popover: oklch(0.99 0.006 95);
  --popover-foreground: oklch(0.2 0.04 162);
  --primary: oklch(0.42 0.11 162);
  --primary-foreground: oklch(0.99 0.006 95);
  --secondary: oklch(0.95 0.015 152);
  --secondary-foreground: oklch(0.2 0.04 162);
  --muted: oklch(0.95 0.015 152);
  --muted-foreground: oklch(0.4 0.03 162);
  --accent: oklch(0.74 0.13 82);
  --accent-foreground: oklch(0.2 0.04 162);
  --destructive: oklch(0.48 0.17 28);
  --border: oklch(0.87 0.02 152);
  --input: oklch(0.87 0.02 152);
  --ring: oklch(0.74 0.13 82);
  --radius: 0.375rem;
}
.prep-page { font-family: 'DM Sans', sans-serif; }
.prep-heading { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; letter-spacing: 0; }
.prep-footer { background: var(--site-ink); color: var(--site-surface); }
.prep-footer a { color: color-mix(in oklab, var(--site-surface) 80%, var(--site-ink)); }
.prep-footer a:hover { color: var(--site-gold); }
.suvira-ai-prep-fab { position: fixed; left: 24px; bottom: 24px; z-index: 60; background: var(--site-ink); color: var(--site-surface); border: 1px solid var(--site-gold); border-radius: 6px; padding: 11px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; box-shadow: var(--site-shadow); transition: transform 180ms ease, background 180ms ease; }
.suvira-ai-prep-fab:hover { background: var(--site-action); transform: translateY(-2px); color: var(--site-surface); }
@media (max-width: 768px) { .suvira-ai-prep-fab { left: 16px; bottom: 78px; padding: 9px 13px; font-size: 12px; } }
"""

site_polish_path = os.path.join(DIST, "site-polish.css")
with open(site_polish_path, "r", encoding="utf-8") as f:
    existing_polish = f.read()
if "--site-ink:" not in existing_polish:
    with open(site_polish_path, "w", encoding="utf-8") as f:
        f.write(root_tokens_css + "\n" + existing_polish)

# 4. Write dist/site-enhancements.js
site_enhancements_js = """(function () {
  var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/info@suviraimmigration.com";
  var THANK_YOU_PATH = "/Thank-you/";

  function normalizePath(path) {
    var clean = (path.split(/[?#]/)[0] || "/").replace(/index\\.html$/i, "");
    return clean.length > 1 ? clean.replace(/\\/+$/, "") : "/";
  }

  function ensureHiddenInput(form, name, value) {
    var existing = form.querySelector('input[name="' + name + '"]');
    if (existing) {
      existing.value = value;
      return;
    }
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  function getStatusElement(form) {
    var existing = form.querySelector(".suvira-form-status");
    if (existing) return existing;
    var status = document.createElement("p");
    status.className = "suvira-form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.appendChild(status);
    return status;
  }

  function enhanceFormSubmitForm(form) {
    if (form.dataset.suviraEnhanced === "true") return;
    form.dataset.suviraEnhanced = "true";

    var nextUrl = new URL(THANK_YOU_PATH, window.location.origin).toString();
    ensureHiddenInput(form, "_next", nextUrl);
    ensureHiddenInput(form, "_captcha", "false");

    form.addEventListener("submit", function (event) {
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      event.preventDefault();
      var submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      var originalLabel = submitButton ? submitButton.innerHTML : "";
      var status = getStatusElement(form);

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.textContent = "Submitting your enquiry...";
        }
      }
      status.dataset.state = "pending";
      status.textContent = "Sending your details to Suvira Immigration...";

      var formData = new FormData(form);
      formData.set("_next", nextUrl);
      formData.set("_captcha", "false");
      formData.set("source_page", window.location.pathname);

      fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      })
        .then(function (response) {
          return response.json().catch(function () { return null; }).then(function (payload) {
            var isConfirmed = response.ok && (payload === null || payload.success === true || payload.success === "true");
            if (!isConfirmed) {
              throw new Error((payload && payload.message) || "Submission was not confirmed.");
            }
            status.dataset.state = "success";
            status.textContent = "Thank you. Redirecting to your confirmation page...";
            window.location.assign(THANK_YOU_PATH);
          });
        })
        .catch(function () {
          status.dataset.state = "error";
          status.innerHTML = 'We could not send your form right now. Please try again or <a href="https://wa.me/917338999369" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a>.';
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute("aria-busy");
            if (submitButton instanceof HTMLButtonElement) {
              submitButton.innerHTML = originalLabel;
            }
          }
        });
    });
  }

  function fixHeroContrast(root) {
    var parseRGB = function (s) {
      var m = s && s.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?/);
      return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
    };
    var lum = function (rgb) {
      var vals = [rgb[0], rgb[1], rgb[2]].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
    };
    var effectiveLum = function (el) {
      var cur = el;
      while (cur && cur !== document.documentElement) {
        var cs = getComputedStyle(cur);
        var bg = cs.backgroundColor;
        var img = cs.backgroundImage;
        var rgb = parseRGB(bg);
        if (rgb && rgb[3] > 0.2) return lum(rgb);
        if (img && img !== "none") {
          var stops = Array.from(img.matchAll(/rgba?\\([\\d.,\\s]+\\)/g))
            .map(function (m) { return parseRGB(m[0]); })
            .filter(Boolean);
          if (stops.length) {
            return stops.reduce(function (a, c) { return a + lum(c); }, 0) / stops.length;
          }
          if (/url\\(/.test(img)) return 0.08;
        }
        cur = cur.parentElement;
      }
      return 0.95;
    };

    var heroes = root.querySelectorAll(
      'section[class*="hero"], header[class*="hero"], div[class*="hero-section"], .page-hero, .country-hero, .service-hero, .calc-hero'
    );
    heroes.forEach(function (hero) {
      if (hero.classList.contains("horizon-hero") || hero.classList.contains("family-premium-hero")) return;
      var before = getComputedStyle(hero, "::before");
      var hasLightWash = before && before.backgroundImage && /255,\\s*253,\\s*247/.test(before.backgroundImage);
      var L = hasLightWash ? 0.92 : effectiveLum(hero);
      var darkBg = L < 0.42;

      var setImportant = function (el, prop, val) {
        el.style.setProperty(prop, val, "important");
      };
      hero.querySelectorAll("h1, h1 *, h2, .hero-title, [class*='hero-title']").forEach(function (el) {
        if (el.closest(".talk-experts-card, form, [class*='form-card'], [class*='calc-card']")) return;
        setImportant(el, "color", darkBg ? "#ffffff" : "#0f2a1f");
        setImportant(el, "-webkit-text-fill-color", darkBg ? "#ffffff" : "#0f2a1f");
        setImportant(el, "background", "none");
        setImportant(el, "opacity", "1");
      });
      hero.querySelectorAll("p, li, .hero-sub, .hero-desc, [class*='hero-desc'], [class*='hero-sub']").forEach(function (el) {
        if (el.closest(".talk-experts-card, form, [class*='form-card'], [class*='calc-card']")) return;
        setImportant(el, "color", darkBg ? "rgba(255,255,255,0.9)" : "#24372e");
        setImportant(el, "opacity", "1");
      });
      hero.querySelectorAll(".talk-experts-card, [class*='form-card']").forEach(function (card) {
        setImportant(card, "background", "#ffffff");
        card.querySelectorAll("h2, h3, h4, label, p, span").forEach(function (t) {
          if (t.closest("button, a")) return;
          setImportant(t, "color", "#14231c");
          setImportant(t, "-webkit-text-fill-color", "#14231c");
        });
      });
    });
  }

  function installSiteEnhancements(root) {
    if (!root || root.dataset.suviraInstalled === "true") return;
    root.dataset.suviraInstalled = "true";

    var currentPath = normalizePath(window.location.pathname);
    root.querySelectorAll(".suvira-navbar a[href]").forEach(function (anchor) {
      var href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (normalizePath(href) === currentPath) {
        anchor.setAttribute("aria-current", "page");
      } else {
        anchor.removeAttribute("aria-current");
      }
    });

    root.querySelectorAll('form[action*="formsubmit.co"]').forEach(enhanceFormSubmitForm);

    var revealTargets = Array.from(
      root.querySelectorAll(
        ".visa-intent-header-wrap, .visa-country-card, .free-calc-card, .ldr-card, .partner-card-3d, .why-stat-card, .talk-experts-card, .service-card, .country-card, .step-card, .blog-card, .calc-card, .faq-item"
      )
    );
    revealTargets.forEach(function (element, index) {
      element.classList.add("suvira-reveal");
      element.style.setProperty("--reveal-delay", ((index % 4) * 75) + "ms");
    });

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealTargets.forEach(function (element) { observer.observe(element); });
    } else {
      revealTargets.forEach(function (element) { element.classList.add("is-revealed"); });
    }

    var finePointer = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches;
    if (finePointer) {
      var heroPhoto = root.querySelector(".horizon-photo");
      var onScroll = function () {
        if (!heroPhoto) return;
        var y = Math.min(window.scrollY, 680);
        heroPhoto.style.transform = "scale(1.05) translate3d(0, " + Math.round(y * 0.07) + "px, 0)";
      };
      if (heroPhoto) {
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
      }
      root.querySelectorAll(".visa-country-card").forEach(function (card) {
        card.addEventListener("pointermove", function (event) {
          var rect = card.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--tilt-x", (-y * 4).toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", (x * 5).toFixed(2) + "deg");
        });
        card.addEventListener("pointerleave", function () {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
        });
      });
    }

    var heroIcons = [
      { cls: "hero-fly-icon-1", svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"/></svg>' },
      { cls: "hero-fly-icon-2", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>' },
      { cls: "hero-fly-icon-3", svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>' }
    ];
    root.querySelectorAll(
      'section[class*="hero"], header[class*="hero"], div[class*="hero-section"], .page-hero, .country-hero, .service-hero'
    ).forEach(function (hero) {
      if (hero.querySelector(".hero-fly-icon")) return;
      var pos = getComputedStyle(hero).position;
      if (pos === "static") hero.style.position = "relative";
      heroIcons.forEach(function (item) {
        var span = document.createElement("span");
        span.className = "hero-fly-icon " + item.cls;
        span.setAttribute("aria-hidden", "true");
        span.innerHTML = item.svg;
        hero.appendChild(span);
      });
    });

    fixHeroContrast(root);
    requestAnimationFrame(function () { fixHeroContrast(root); });
    setTimeout(function () { fixHeroContrast(root); }, 250);
  }

  function boot() {
    var container = document.querySelector(".suvira-site") || document.body;
    installSiteEnhancements(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
"""

with open(os.path.join(DIST, "site-enhancements.js"), "w", encoding="utf-8") as f:
    f.write(site_enhancements_js)

# 5. Parse and render all 65 pages from src/content/pages/*.ts into dist/
def load_ts_page(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    imports = dict(re.findall(r"import\s+([a-zA-Z0-9_]+)\s+from\s+\"@/assets/([^\"]+)\";", text))
    replaces = re.findall(r"\.replaceAll\(\s*\"([^\"]+)\"\s*,\s*([a-zA-Z0-9_]+)\s*\)", text)
    json_line = None
    for line in text.splitlines():
        if line.startswith("export default {") and not line.startswith("export default { ...page"):
            json_line = line[len("export default "):]
            break
        elif line.startswith("const page = {"):
            json_line = line[len("const page = "):]
            break
    json_line = re.sub(r"\s*satisfies\s+StaticPageData;\s*$", "", json_line)
    json_line = re.sub(r"(\.replaceAll\(\s*\"[^\"]+\"\s*,\s*[a-zA-Z0-9_]+\s*\))+", "", json_line)
    data = json.loads(json_line)
    body = data["body"]
    for old, var in replaces:
        asset_file = imports[var]
        body = body.replace(old, "/assets/" + asset_file)
    data["body"] = body
    return data

def render_static_html(page):
    route_path = page["routePath"]
    title = page.get("title") or "Suvira Immigration"
    head_parts = [
        '  <meta charset="utf-8"/>',
        '  <meta name="viewport" content="width=device-width, initial-scale=1"/>',
        f'  <title>{html.escape(title)}</title>',
        '  <link rel="preconnect" href="https://fonts.googleapis.com"/>',
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>',
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"/>',
    ]

    for meta in page.get("metas", []):
        attrs = []
        for k, v in meta.items():
            if k in ("charSet", "charset") or k == "name" and v.lower() == "viewport":
                continue
            attrs.append(f'{k}="{html.escape(str(v), quote=True)}"')
        if attrs:
            head_parts.append(f'  <meta {" ".join(attrs)}/>')

    for link in page.get("links", []):
        attrs = [f'{k}="{html.escape(str(v), quote=True)}"' for k, v in link.items()]
        if attrs:
            head_parts.append(f'  <link {" ".join(attrs)}/>')

    for st in page.get("styles", []):
        head_parts.append(f'  <style>{st}</style>')

    head_parts.append('  <link rel="stylesheet" href="/site-polish.css"/>')

    for jld in page.get("jsonLd", []):
        head_parts.append(f'  <script type="application/ld+json">{jld}</script>')

    body_html = (
        page["body"]
        .replace("/images/suvira-butterfly-icon.png", "/images/suvira-logo.png")
        .replace(
            '<a href="/services/study-visas" rel="noopener noreferrer"><i class="fas fa-graduation-cap"></i> Study Visa</a>',
            '<a href="/services/study-visas"><i class="fas fa-graduation-cap"></i> Study Visa</a>'
            '<a href="/services/study-visas/canada"><i class="fas fa-university"></i> Study in Canada</a>'
            '<a href="/services/study-visas/uk"><i class="fas fa-book-reader"></i> Study in UK</a>'
            '<a href="/services/study-visas/australia"><i class="fas fa-graduation-cap"></i> Study in Australia</a>'
            '<a href="/services/study-visas/usa"><i class="fas fa-flag-usa"></i> Study in USA</a>'
            '<a href="/services/study-visas/germany"><i class="fas fa-landmark"></i> Study in Germany</a>'
            '<a href="/services/study-visas/ireland"><i class="fas fa-clover"></i> Study in Ireland</a>'
            '<a href="/services/study-visas/newzealand"><i class="fas fa-mountain"></i> Study in New Zealand</a>'
        )
    )

    is_confirmation = route_path in ("/Thank-you", "/thankyou")
    is_home = route_path == "/"
    is_study = route_path.startswith("/services/study-visas")
    classes = ["suvira-site"]
    if is_home:
        classes.append("suvira-editorial")
    if is_study:
        classes.append("suvira-study")
    if is_confirmation:
        classes.append("suvira-confirmation")
    wrapper_class = " ".join(classes)

    script_parts = []
    for sc in page.get("scripts", []):
        if sc.get("src"):
            script_parts.append(f'  <script src="{html.escape(sc["src"], quote=True)}"></script>')
        elif sc.get("code"):
            script_parts.append(f'  <script>{sc["code"]}</script>')
    script_parts.append('  <script src="/site-enhancements.js" defer></script>')

    return (
        "<!DOCTYPE html>\n"
        '<html lang="en">\n'
        "<head>\n"
        + "\n".join(head_parts)
        + "\n</head>\n"
        "<body>\n"
        f'<div class="{wrapper_class}">\n'
        + body_html
        + "\n</div>\n"
        '<a href="/ai-preparation/" class="suvira-ai-prep-fab">AI Preparation \u2192</a>\n'
        + "\n".join(script_parts)
        + "\n</body>\n"
        "</html>\n"
    )

ts_files = sorted(glob.glob(os.path.join(ROOT, "src", "content", "pages", "*.ts")))
for ts_path in ts_files:
    page = load_ts_page(ts_path)
    route_path = page["routePath"]
    rendered = render_static_html(page)

    targets = []
    if route_path == "/":
        targets.append(os.path.join(DIST, "index.html"))
    elif route_path == "/Thank-you":
        targets.append(os.path.join(DIST, "Thank-you", "index.html"))
        targets.append(os.path.join(DIST, "thankyou", "index.html"))
    elif route_path == "/free-eligibility-check":
        targets.append(os.path.join(DIST, "free-eligibility-check", "index.html"))
    elif route_path.startswith("/countries/") and route_path != "/countries":
        slug = route_path[len("/countries/"):]
        targets.append(os.path.join(DIST, "countries", f"{slug}.html"))
        targets.append(os.path.join(DIST, "countries", slug, "index.html"))
    else:
        rel = route_path.lstrip("/")
        targets.append(os.path.join(DIST, rel, "index.html"))

    for t in targets:
        os.makedirs(os.path.dirname(t), exist_ok=True)
        with open(t, "w", encoding="utf-8") as f:
            f.write(rendered)

# 6. Write dist/ai-preparation/index.html
ai_prep_dir = os.path.join(DIST, "ai-preparation")
os.makedirs(ai_prep_dir, exist_ok=True)
with open(os.path.join(ai_prep_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>AI Consultation Preparation | Suvira Immigration</title>
  <meta name="description" content="Prepare a personalized potential document checklist and consultation questions for your immigration journey. Informational only, not legal advice."/>
  <link rel="canonical" href="/ai-preparation/"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"/>
  <link rel="stylesheet" href="/site-polish.css"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: var(--site-surface); color: var(--site-ink); font-family: 'DM Sans', sans-serif; }
    .prep-container { max-width: 1152px; margin: 0 auto; padding: 0 20px; }
    .prep-header { border-bottom: 1px solid var(--site-line); background: var(--site-surface); }
    .prep-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 0; }
    .prep-logo img { width: 88px; height: 88px; object-fit: contain; display: block; }
    .prep-nav { display: flex; align-items: center; gap: 28px; font-size: 14px; }
    .prep-nav a { color: var(--site-ink); text-decoration: none; font-weight: 500; }
    .prep-nav a.active { color: var(--site-action); font-weight: 600; }
    .prep-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: var(--site-action); color: var(--site-surface) !important; border: 1px solid var(--site-action); border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
    .prep-btn-outline { background: var(--site-surface); color: var(--site-ink) !important; border: 1px solid var(--site-line); padding: 10px 14px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
    .prep-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--site-muted); text-decoration: none; margin-top: 36px; }
    .prep-hero-grid { display: grid; grid-template-columns: 1fr 0.65fr; gap: 40px; align-items: start; margin-top: 28px; }
    .prep-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--site-action); margin-bottom: 14px; }
    .prep-title { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: clamp(34px, 4vw, 48px); line-height: 1.12; margin: 0; color: var(--site-ink); }
    .prep-lead { margin-top: 18px; max-width: 520px; line-height: 1.75; color: var(--site-muted); font-size: 16px; }
    .prep-notice-box { display: flex; gap: 12px; border-left: 3px solid var(--site-action); background: var(--site-soft); padding: 20px; font-size: 14px; line-height: 1.65; color: var(--site-ink); border-radius: 0 6px 6px 0; }
    .prep-main-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: start; margin: 40px 0 64px; }
    .prep-panel { border-top: 1px solid var(--site-line); padding-top: 28px; }
    .prep-panel h2 { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 26px; margin: 0; }
    .prep-field { margin-top: 22px; }
    .prep-field label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--site-ink); }
    .prep-input, .prep-textarea { width: 100%; border: 1px solid var(--site-line); border-radius: 6px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--site-ink); background: #fff; }
    .prep-char-count { margin: 4px 0 0; text-align: right; font-size: 12px; color: var(--site-muted); }
    .prep-error { margin-top: 16px; border: 1px solid var(--site-error); background: color-mix(in oklab, var(--site-error) 8%, #fff); padding: 14px; font-size: 14px; color: var(--site-error); border-radius: 6px; display: none; }
    .prep-doc-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px 0; border-bottom: 1px solid var(--site-line); cursor: pointer; }
    .prep-doc-item input[type="checkbox"] { margin-top: 4px; width: 16px; height: 16px; accent-color: var(--site-action); }
    .prep-uncertainties { margin-top: 28px; background: var(--site-soft); padding: 20px; border-radius: 6px; }
    @media (max-width: 900px) { .prep-hero-grid, .prep-main-grid { grid-template-columns: 1fr; gap: 28px; } }
  </style>
</head>
<body>
  <div class="prep-page">
    <header class="prep-header">
      <div class="prep-container prep-header-inner">
        <a href="/" class="prep-logo"><img src="/images/suvira-logo.png" alt="Suvira Immigration" width="88" height="88"/></a>
        <nav aria-label="Main navigation" class="prep-nav">
          <a href="/services">Visa services</a>
          <a href="/ai-preparation/" class="active">AI Preparation</a>
          <a href="/contact">Contact us</a>
          <a href="/free-eligibility-check" class="prep-btn">Eligibility check &rarr;</a>
        </nav>
      </div>
    </header>
    <main class="prep-container">
      <a href="/" class="prep-back">&larr; Back to Suvira</a>
      <div class="prep-hero-grid">
        <div>
          <div class="prep-eyebrow">&#10024; Consultation preparation</div>
          <h1 class="prep-title">Your journey.<br/>A more prepared start.</h1>
          <p class="prep-lead">A personalized starting point for the documents and questions to bring to your immigration consultation.</p>
        </div>
        <aside class="prep-notice-box">
          <div>
            <strong style="display:block; margin-bottom:6px;">Informational only &middot; Not legal advice</strong>
            AI-generated information only&mdash;not legal advice or an official document list. Requirements change; confirm everything with the destination government and a qualified immigration adviser.
          </div>
        </aside>
      </div>
      <div class="prep-main-grid">
        <section aria-label="Your immigration background" class="prep-panel">
          <h2>Tell us about your plans</h2>
          <p style="margin-top:8px; font-size:12px; line-height:1.6; color:var(--site-muted);">Your description is used to structure your consultation checklist. Avoid passport numbers, account details, or sensitive records.</p>
          <form id="prepForm" novalidate>
            <div class="prep-field">
              <label for="destination">Destination country</label>
              <input id="destination" class="prep-input" placeholder="e.g. Canada" minlength="2" maxlength="100" required/>
            </div>
            <div class="prep-field">
              <label for="background">Your background</label>
              <textarea id="background" class="prep-textarea" rows="5" minlength="20" maxlength="2500" placeholder="Nationality, current country, education, work experience, language tests, and family situation (if relevant)." required></textarea>
              <p id="bgCount" class="prep-char-count">0/2500</p>
            </div>
            <div class="prep-field">
              <label for="goals">Visa goals</label>
              <textarea id="goals" class="prep-textarea" rows="4" minlength="10" maxlength="1500" placeholder="What would you like to do? Mention your intended visa, plans, and timeline if known." required></textarea>
            </div>
            <p id="prepError" role="alert" class="prep-error"></p>
            <button type="submit" id="prepSubmit" class="prep-btn" style="width:100%; height:48px; margin-top:22px;">&#10024; Generate my preparation</button>
          </form>
        </section>
        <section aria-label="Your preparation" aria-live="polite" class="prep-panel" id="prepOutput">
          <div style="padding:36px 0;">
            <h2 class="prep-heading" style="font-size:26px;">Ready for your next step</h2>
            <div style="margin-top:24px; display:grid; gap:18px; color:var(--site-muted); font-size:14px;">
              <div>&#10003; Potential documents, with reasons and applicability</div>
              <div>&#10003; Questions for your immigration adviser</div>
              <div>&#10003; Unknowns and requirements to confirm</div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer class="prep-footer" style="margin-top:48px; border-top:1px solid var(--site-line);">
      <div class="prep-container" style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:20px; padding:32px 20px; font-size:14px;">
        <a href="/" aria-label="Suvira Immigration home"><img src="/images/suvira-logo.png" alt="Suvira Immigration" width="110" height="110" style="border-radius:6px; background:var(--site-surface); padding:8px;" loading="lazy"/></a>
        <div style="display:flex; flex-wrap:wrap; gap:24px;">
          <a href="/contact" style="text-decoration:none;">Contact us</a>
          <a href="/privacy-policy" style="text-decoration:none;">Privacy policy</a>
          <a href="/disclaimer" style="text-decoration:none;">Disclaimer</a>
        </div>
      </div>
    </footer>
  </div>
  <script>
  (function() {
    var NOTICE = "AI-generated information only—not legal advice or an official document list. Requirements change; confirm everything with the destination government and a qualified immigration adviser.";
    var bgInput = document.getElementById("background");
    var bgCount = document.getElementById("bgCount");
    var form = document.getElementById("prepForm");
    var errorEl = document.getElementById("prepError");
    var outputEl = document.getElementById("prepOutput");
    var submitBtn = document.getElementById("prepSubmit");
    bgInput.addEventListener("input", function() { bgCount.textContent = bgInput.value.length + "/2500"; });
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      var dest = document.getElementById("destination").value.trim();
      var bg = bgInput.value.trim();
      var goals = document.getElementById("goals").value.trim();
      if (dest.length < 2 || bg.length < 20 || goals.length < 10) {
        errorEl.style.display = "block";
        errorEl.textContent = "Please enter a country, at least 20 characters of background, and 10 characters of visa goals.";
        return;
      }
      errorEl.style.display = "none";
      var docs = [
        { name: "Valid Passport & Travel History", category: "Identity", applicability: "Commonly requested", reason: "Confirms nationality and validity for " + dest + "." },
        { name: "Academic Degrees & Official Transcripts", category: "Education", applicability: "Commonly requested", reason: "Needed for credential assessment or study admission in " + dest + "." },
        { name: "Language Proficiency Test Results (IELTS / PTE / CELPIP)", category: "Education", applicability: "Commonly requested", reason: "Verifies language threshold compliance for " + dest + "." },
        { name: "Updated CV & Employment Reference Letters", category: "Work", applicability: "Commonly requested", reason: "Documents work duties, duration, and occupation alignment." },
        { name: "6-Month Bank Statements & Financial Proof", category: "Finances", applicability: "Commonly requested", reason: "Demonstrates unencumbered funds required for " + dest + "." },
        { name: "Police Clearance & Medical Readiness", category: "Identity", applicability: "Confirm with adviser", reason: "Confirms admissibility at the filing stage." }
      ];
      var questions = [
        "Which exact visa stream in " + dest + " best fits my background and timeline?",
        "How does my experience map to the official occupation classification for " + dest + "?",
        "What language test score targets will maximize my eligibility?",
        "What are the current financial proof thresholds and processing timelines?"
      ];
      var uncertainties = [
        "Official points cutoffs, occupation lists, and government fees for " + dest + " change regularly and must be verified with a Suvira adviser.",
        "Exact equivalency of credentials and employment letters should be reviewed before filing."
      ];
      outputEl.innerHTML = '<h2 class="prep-heading" style="font-size:30px;">Your ' + dest + ' preparation</h2>' +
        '<div style="margin-top:16px; border-top:1px solid var(--site-line);">' +
        docs.map(function(d) { return '<label class="prep-doc-item"><input type="checkbox"/><div><strong style="display:block;font-size:14px;">' + d.name + '</strong><span style="display:block;font-size:12px;color:var(--site-action);margin-top:4px;">' + d.category + ' &middot; ' + d.applicability + '</span><span style="display:block;font-size:13px;color:var(--site-muted);margin-top:6px;">' + d.reason + '</span></div></label>'; }).join("") +
        '</div><h3 style="margin-top:24px;font-size:16px;">Questions for your consultation</h3><ol style="padding-left:20px;font-size:14px;line-height:1.65;">' +
        questions.map(function(q) { return '<li>' + q + '</li>'; }).join("") + '</ol>' +
        '<div class="prep-uncertainties"><strong>Confirm before proceeding</strong><ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:var(--site-muted);">' +
        uncertainties.map(function(u) { return '<li>' + u + '</li>'; }).join("") + '</ul></div>' +
        '<a href="/contact" class="prep-btn" style="margin-top:18px;">Discuss with a Suvira adviser &rarr;</a>';
    });
  })();
  </script>
</body>
</html>
""")

# 7. Write dist/staticwebapp.config.json
with open(os.path.join(DIST, "staticwebapp.config.json"), "w", encoding="utf-8") as f:
    json.dump({
        "routes": [
            {"route": "/thankyou", "rewrite": "/Thank-you/index.html"},
            {"route": "/thankyou/*", "rewrite": "/Thank-you/index.html"},
            {"route": "/Thank-you", "rewrite": "/Thank-you/index.html"},
            {"route": "/Thank-you/*", "rewrite": "/Thank-you/index.html"},
            {"route": "/ai-preparation", "rewrite": "/ai-preparation/index.html"},
            {"route": "/free-eligibility-check", "rewrite": "/free-eligibility-check/index.html"}
        ],
        "navigationFallback": {
            "rewrite": "/index.html",
            "exclude": ["/images/*", "/assets/*", "/*.css", "/*.js"]
        }
    }, f, indent=2)

print("Built static dist/ from src/ and public/ successfully.")
