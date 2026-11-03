(function () {
  var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/info@suviraimmigration.com";
  var THANK_YOU_PATH = "/Thank-you/";

  function normalizePath(path) {
    var clean = (path.split(/[?#]/)[0] || "/").replace(/index\.html$/i, "");
    return clean.length > 1 ? clean.replace(/\/+$/, "") : "/";
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
      var m = s && s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
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
          var stops = Array.from(img.matchAll(/rgba?\([\d.,\s]+\)/g))
            .map(function (m) { return parseRGB(m[0]); })
            .filter(Boolean);
          if (stops.length) {
            return stops.reduce(function (a, c) { return a + lum(c); }, 0) / stops.length;
          }
          if (/url\(/.test(img)) return 0.08;
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
      var hasLightWash = before && before.backgroundImage && /255,\s*253,\s*247/.test(before.backgroundImage);
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
