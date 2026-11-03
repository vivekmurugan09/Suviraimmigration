(function () {
  var WEB3FORMS_KEY = "8fcdbf26-e2cf-4688-b37b-8c69f9d49399";
  var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  var FORM_ENDPOINT = "https://api.web3forms.com/submit";
  var BACKUP_FORM_ENDPOINT = "https://formsubmit.co/ajax/reachus@suviraimmigration.com";
  var FORMSUBMIT_IO_ENDPOINT = "https://formsubmit.io/send/reachus@suviraimmigration.com";
  var THANK_YOU_PATH = "/Thank-you/";
  var probe = null;

  function parseRgb(value) {
    if (!value || value === "transparent") return null;
    if (!/^rgba?\(/.test(value)) {
      if (!probe) {
        var canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        probe = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!probe) return null;
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = "#000";
      probe.fillStyle = value;
      probe.fillRect(0, 0, 1, 1);
      var d = probe.getImageData(0, 0, 1, 1).data;
      return [d[0] || 0, d[1] || 0, d[2] || 0, (d[3] || 0) / 255];
    }
    var m = value.match(/rgba?\(([^)]+)\)/);
    if (!m || !m[1]) return null;
    var p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [p[0] || 0, p[1] || 0, p[2] || 0, p[3] === undefined ? 1 : p[3]];
  }

  function luminance(rgb) {
    var c = [rgb[0] || 0, rgb[1] || 0, rgb[2] || 0].map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function backgroundOf(el) {
    while (el && el !== document.documentElement) {
      var cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage.indexOf("url(") !== -1) return null;
      var bg = parseRgb(cs.backgroundColor);
      if (bg && bg[3] > 0.6) return luminance(bg);
      var grad = cs.backgroundImage && cs.backgroundImage.match(/(?:rgba?|oklch|hsla?)\([^)]+\)/);
      if (grad) {
        var g = parseRgb(grad[0]);
        if (g && g[3] > 0.6) return luminance(g);
      }
      el = el.parentElement;
    }
    return 1;
  }

  function fixLowContrastText(root) {
    root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,span,label,strong,small,a").forEach(function (el) {
      if (!el.textContent || !el.textContent.trim() || el.closest(".horizon-hero")) return;
      var cs = getComputedStyle(el);
      if (cs.webkitTextFillColor === "transparent" || cs.backgroundClip === "text") return;
      var fg = parseRgb(cs.color);
      var bgL = backgroundOf(el);
      if (!fg || bgL === null) return;
      var fgL = luminance(fg);
      var ratio = (Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05);
      if (ratio >= 3) return;
      var dark = bgL < 0.3;
      el.style.setProperty("color", dark ? "var(--site-surface, #fff)" : "var(--site-ink, #0f2a24)", "important");
      el.style.setProperty("-webkit-text-fill-color", "currentColor", "important");
    });
  }

  function injectFlyingIcons(root) {
    var heroes = Array.from(root.querySelectorAll(".study-hero-slides, .horizon-hero"));
    if (!heroes.length) {
      var heading = root.querySelector("main h1, .main-content h1, h1");
      var hero = heading ? heading.closest("section, header") : null;
      if (hero) heroes.push(hero);
    }
    var icons = [
      ["plane", '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>'],
      ["globe", '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'],
      ["pin", '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>']
    ];
    heroes.forEach(function (h) {
      var host = h.closest("section, header") || h;
      if (host.querySelector(".hero-fly-icon")) return;
      icons.forEach(function (pair, index) {
        var icon = document.createElement("span");
        icon.className = "hero-fly-icon hero-fly-icon-" + (index + 1);
        icon.dataset.icon = pair[0];
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + pair[1] + "</svg>";
        host.appendChild(icon);
      });
    });
  }

  function installSiteEnhancements(root) {
    if (!root || root.dataset.suviraInstalled === "true") return;
    root.dataset.suviraInstalled = "true";

    var busy = new WeakSet();

    // Header menu links (desktop nav + mobile drawer) open in a new browser tab.
    document.addEventListener("click", function (event) {
      var target = event.target;
      var link = target && target.closest ? target.closest("a[href]") : null;
      if (!link || !link.closest(".suvira-nav-menu, .mobile-nav, .nav-dropdown-menu")) return;
      var href = link.getAttribute("href") || "";
      if (!href || href.indexOf("#") === 0 || href.indexOf("tel:") === 0 || href.indexOf("mailto:") === 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.open(link.href, "_blank", "noopener");
    }, { capture: true });

    // Normalize all migrated forms so none use legacy inline onsubmit or direct browser POSTs.
    root.querySelectorAll("form").forEach(function (form) {
      form.removeAttribute("onsubmit");
      form.action = FORM_ENDPOINT;
      form.method = "post";
      if (!form.querySelector('input[name="access_key"]')) {
        var ak = document.createElement("input");
        ak.type = "hidden";
        ak.name = "access_key";
        ak.value = WEB3FORMS_KEY;
        form.appendChild(ak);
      }
      if (!form.querySelector('input[name="from_name"]')) {
        var fn = document.createElement("input");
        fn.type = "hidden";
        fn.name = "from_name";
        fn.value = "Suvira Immigration Website";
        form.appendChild(fn);
      }
      form.querySelectorAll("input,select,textarea").forEach(function (field) {
        if (!field.name && field.id) field.name = field.id;
        if (!field.getAttribute("aria-label") && (!field.id || !form.querySelector('label[for="' + field.id + '"]'))) {
          field.setAttribute("aria-label", field.getAttribute("placeholder") || field.name || "Select an option");
        }
        if (field instanceof HTMLInputElement) {
          if (field.type === "email") field.autocomplete = "email";
          if (field.type === "tel") { field.autocomplete = "tel"; field.inputMode = "tel"; }
          if (/name/i.test(field.name)) field.autocomplete = "name";
        }
      });
    });

    // Capture all form submissions before legacy handlers and send with explicit origin Referer.
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !root.contains(form)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (busy.has(form) || (typeof form.reportValidity === "function" && !form.reportValidity())) return;

      var phone = form.querySelector('input[type="tel"]');
      if (phone && !/^[+\d\s().-]{7,22}$/.test(phone.value.trim())) {
        phone.setCustomValidity("Please enter a valid phone number.");
        phone.reportValidity();
        phone.addEventListener("input", function () { phone.setCustomValidity(""); }, { once: true });
        return;
      }

      var status = form.querySelector(".suvira-form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "suvira-form-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        form.appendChild(status);
      }

      var buttons = Array.from(form.querySelectorAll('button[type="submit"],input[type="submit"],button:not([type])'));
      var disabledStates = buttons.map(function (b) { return b.disabled; });
      busy.add(form);
      buttons.forEach(function (b) { b.disabled = true; });
      form.setAttribute("aria-busy", "true");
      status.dataset.state = "sending";
      status.textContent = "Sending your request…";

      var thankYouUrl = window.location.origin + THANK_YOU_PATH;

      // 1. Open Thank-You landing page in a separate tab within the synchronous user gesture
      var thankYouTab = null;
      try {
        thankYouTab = window.open(thankYouUrl, "_blank");
      } catch (err) {}

      var data = new FormData(form);
      var nameVal = data.get("Full_Name") || data.get("Full Name") || data.get("name") || data.get("full_name") || data.get("cName") || "";
      var phoneVal = data.get("Phone_/_WhatsApp") || data.get("Phone / WhatsApp") || data.get("phone") || data.get("WhatsApp") || data.get("cPhone") || "";
      var emailVal = data.get("Email_Address") || data.get("Email Address") || data.get("email") || data.get("cEmail") || "";
      var serviceVal = data.get("Service_Required") || data.get("Service Required") || data.get("service") || data.get("visa_type") || "Canada PR / Express Entry";
      var modeVal = data.get("Consultation_Mode") || data.get("Consultation Mode") || data.get("consultation_mode") || "Virtual Video Consultation";
      var pageUrl = window.location.href;
      var dynamicSubject = "New Inquiry (" + serviceVal + "): " + (nameVal || "Website Lead");

      // Standardized Web3Forms payload matching reachus@suviraimmigration.com exact inbox format
      var w3Data = new FormData();
      w3Data.set("access_key", WEB3FORMS_KEY);
      w3Data.set("subject", dynamicSubject);
      w3Data.set("from_name", "Suvira Immigration Website");
      w3Data.set("Full_Name", String(nameVal));
      w3Data.set("Phone_/_WhatsApp", String(phoneVal));
      w3Data.set("Email_Address", String(emailVal));
      w3Data.set("Service_Required", String(serviceVal));
      w3Data.set("Consultation_Mode", String(modeVal));
      w3Data.set("Page_URL", pageUrl);
      w3Data.set("redirect", thankYouUrl);

      // Aliases
      w3Data.set("Full Name", String(nameVal));
      w3Data.set("Phone / WhatsApp", String(phoneVal));
      w3Data.set("Email Address", String(emailVal));
      w3Data.set("Service Required", String(serviceVal));
      w3Data.set("Page URL", pageUrl);

      // 2. Save lead backup in localStorage so inquiries are NEVER lost
      try {
        var backupLeads = JSON.parse(localStorage.getItem("suvira_leads_backup") || "[]");
        var entry = {
          timestamp: new Date().toISOString(),
          Full_Name: nameVal,
          "Phone_/_WhatsApp": phoneVal,
          Email_Address: emailVal,
          Service_Required: serviceVal,
          Consultation_Mode: modeVal,
          Page_URL: pageUrl
        };
        backupLeads.push(entry);
        localStorage.setItem("suvira_leads_backup", JSON.stringify(backupLeads.slice(-50)));
      } catch (e) {}

      // 3. Dispatch submissions across channels
      // A. Direct JSON AJAX to Web3Forms with keepalive
      try {
        fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: dynamicSubject,
            from_name: "Suvira Immigration Website",
            Full_Name: String(nameVal),
            "Phone_/_WhatsApp": String(phoneVal),
            Email_Address: String(emailVal),
            Service_Required: String(serviceVal),
            Consultation_Mode: String(modeVal),
            Page_URL: pageUrl
          }),
          keepalive: true
        }).catch(function () {});
      } catch (err) {}

      // B. Backup to FormSubmit.io with keepalive
      try {
        fetch(FORMSUBMIT_IO_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          referrerPolicy: "origin",
          body: w3Data,
          keepalive: true
        }).catch(function () {});
      } catch (err) {}

      // C. Native hidden iframe POST to Web3Forms
      try {
        var iframeName = "suvira_form_sink";
        var sink = document.getElementById(iframeName);
        if (!sink) {
          sink = document.createElement("iframe");
          sink.name = iframeName;
          sink.id = iframeName;
          sink.style.display = "none";
          sink.setAttribute("aria-hidden", "true");
          document.body.appendChild(sink);
        }
        var hiddenForm = document.createElement("form");
        hiddenForm.method = "POST";
        hiddenForm.action = WEB3FORMS_ENDPOINT;
        hiddenForm.target = iframeName;
        hiddenForm.style.display = "none";
        w3Data.forEach(function (val, key) {
          var input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val;
          hiddenForm.appendChild(input);
        });
        document.body.appendChild(hiddenForm);
        hiddenForm.submit();
        setTimeout(function () {
          if (hiddenForm.parentNode) hiddenForm.parentNode.removeChild(hiddenForm);
        }, 5000);
      } catch (e) {}

      // 4. Reset form, close modal, and re-enable buttons
      busy.delete(form);
      form.removeAttribute("aria-busy");
      buttons.forEach(function (b, idx) { b.disabled = Boolean(disabledStates[idx]); });
      status.dataset.state = "success";
      status.textContent = "Your request has been received. Thank you!";
      form.reset();
      var modal = document.getElementById("leadModal");
      if (modal && typeof window.closeLeadModal === "function") {
        window.closeLeadModal();
      } else if (modal) {
        modal.style.display = "none";
      }

      // 5. Navigate to Thank-You page if separate tab was blocked
      setTimeout(function () {
        if (!thankYouTab || thankYouTab.closed || typeof thankYouTab.closed === "undefined") {
          window.location.assign(THANK_YOU_PATH);
        }
      }, 400);
      } catch (err) {}
    }, { capture: true });

    root.querySelectorAll('a[href^="/"]').forEach(function (link) {
      link.removeAttribute("target");
      if (link.pathname.replace(/\/+$/, "") === window.location.pathname.replace(/\/+$/, "")) {
        link.setAttribute("aria-current", "page");
      }
    });

    var menu = root.querySelector(".mobile-menu");
    var toggle = root.querySelector(".mobile-menu-btn");
    if (menu && toggle) {
      menu.id = "mobile-menu";
      toggle.setAttribute("aria-label", "Open navigation");
    }
    var closeBtn = root.querySelector(".close-menu");
    if (closeBtn) closeBtn.setAttribute("aria-label", "Close navigation");

    var modal = root.querySelector("#leadModal") || document.getElementById("leadModal");
    if (modal) {
      var modalShown = false;

      var openModal = function (serviceName) {
        if (!modal) return;
        if (serviceName) {
          var sInput = modal.querySelector('input[name="service"], select[name="service"]');
          if (sInput) sInput.value = serviceName;
        }
        modal.classList.remove("is-closing");
        modal.classList.add("is-visible");
        modal.style.display = "flex";
      };

      var showAutoModal = function () {
        if (modalShown) return;
        if (sessionStorage.getItem("suvira_consultation_dismissed") || sessionStorage.getItem("popupShown")) return;
        modalShown = true;
        openModal();
      };

      var hideModal = function () {
        modal.classList.add("is-closing");
        window.setTimeout(function () {
          modal.classList.remove("is-visible", "is-closing");
          modal.style.display = "none";
        }, 250);
        sessionStorage.setItem("suvira_consultation_dismissed", "true");
        sessionStorage.setItem("popupShown", "true");
      };

      window.openLeadModal = openModal;
      window.closeLeadModal = hideModal;
      window.handleModalSubmit = window.handleModalSubmit || function () { /* handled by capture */ };

      modal.addEventListener("click", function (e) {
        if (e.target === modal) hideModal();
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && (modal.classList.contains("is-visible") || modal.style.display === "flex")) {
          hideModal();
        }
      });

      modal.querySelectorAll('button[aria-label="Close"], .close-modal, .lead-modal-close').forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          hideModal();
        });
      });

      root.querySelectorAll('[onclick*="leadModal"]').forEach(function (button) {
        button.removeAttribute("onclick");
        button.addEventListener("click", function (e) {
          e.preventDefault();
          if (window.openLeadModal) window.openLeadModal();
        });
      });

      var onScrollEnd = function () {
        if (modalShown) return;
        if (sessionStorage.getItem("suvira_consultation_dismissed") || sessionStorage.getItem("popupShown")) return;
        var scrollPos = (window.scrollY || window.pageYOffset || document.documentElement.scrollTop) + window.innerHeight;
        var totalHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        if (totalHeight > 900 && (scrollPos >= totalHeight - 700 || scrollPos / totalHeight >= 0.78)) {
          showAutoModal();
        }
      };
      window.addEventListener("scroll", onScrollEnd, { passive: true });
    } else {
      root.querySelectorAll('[onclick*="leadModal"]').forEach(function (button) {
        button.removeAttribute("onclick");
        button.addEventListener("click", function () { window.location.assign("/free-eligibility-check"); });
      });
    }

    root.querySelectorAll(".suvira-btn-eligibility").forEach(function (button) {
      button.removeAttribute("onclick");
      button.addEventListener("click", function () { window.location.assign("/free-eligibility-check"); });
    });

    injectFlyingIcons(root);

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.querySelectorAll("[data-leadership-mode]").forEach(function (link) {
      link.addEventListener("click", function () {
        var mode = root.querySelector("#teMode");
        if (mode) {
          mode.value = link.dataset.leadershipMode || mode.value;
          mode.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    var observer = !reduced && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 })
      : null;

    if (observer) {
      root.querySelectorAll(".service-card,.country-card,.contact-card,.partner-card-3d,.section-title,.ldr-card,.visa-country-card,.free-calc-card,.story-card,.horizon-pathway,.visa-intent-heading,.leadership-title,.free-calc-title,.program-card,.pnp-card,.doc-check-card,.study-card,.study-uni-card,.calc-other-card,.calc-step-card,.adviser-photo,.executive-copy,.executive-visual,.executive-consult,.study-campus-figure,.study-journey-step,.study-premium-feature,.study-support-item").forEach(function (element) {
        var siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
        element.style.setProperty("--reveal-delay", (Math.min(siblings.indexOf(element) % 4, 3) * 85) + "ms");
        element.classList.add("suvira-reveal");
        observer.observe(element);
      });
    }

    var frame = 0;
    var photo = root.querySelector(".horizon-photo");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!reduced && photo) {
      var updatePhoto = function () {
        frame = 0;
        var hero = photo.parentElement;
        if (!hero) return;
        var bounds = hero.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
          var offset = Math.max(-36, Math.min(36, -bounds.top * 0.065));
          photo.style.transform = "translateY(" + offset + "px) scale(1.08)";
        }
      };
      var schedulePhoto = function () {
        if (!frame) frame = window.requestAnimationFrame(updatePhoto);
      };
      window.addEventListener("scroll", schedulePhoto, { passive: true });
      schedulePhoto();
    }

    if (!reduced && finePointer) {
      root.querySelectorAll(".horizon-pathway,.visa-country-card").forEach(function (card) {
        card.addEventListener("pointermove", function (event) {
          var rect = card.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--tilt-x", (-y * 3) + "deg");
          card.style.setProperty("--tilt-y", (x * 3) + "deg");
        });
        card.addEventListener("pointerleave", function () {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
        });
      });
    }

    window.setTimeout(function () { fixLowContrastText(root); }, 300);
  }

  function boot() {
    var container = document.querySelector(".suvira-site") || document.body;
    if (container) installSiteEnhancements(container);
  }

  if (document.querySelector(".suvira-site")) {
    boot();
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
