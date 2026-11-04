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

# Find the true project root by searching upward for public/ and src/content/
probe = os.path.dirname(os.path.abspath(__file__))
ROOT = None
while probe and probe != os.path.dirname(probe):
    if os.path.exists(os.path.join(probe, "public")) and os.path.exists(os.path.join(probe, "src", "content")):
        ROOT = probe
        break
    probe = os.path.dirname(probe)
if not ROOT:
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
  --site-ink: #0b2e23;
  --site-muted: #4e6559;
  --site-soft: #F8FAFC;
  --site-surface: #FFFFFF;
  --site-action: #059669;
  --site-gold: #F59E0B;
  --site-rose: #0f5a43;
  --site-line: #E2E8F0;
  --site-shadow: 0 22px 48px -28px rgba(11, 46, 35, 0.28);
  --site-success: #16A34A;
  --site-error: #DC2626;
  --site-hero-wash: linear-gradient(96deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.9) 55%, rgba(241, 245, 249, 0.72) 100%);
  --site-photo-ink: #FFFFFF;
  --site-photo-muted: #E2E8F0;
  --site-photo-scrim: rgba(11, 46, 35, 0.62);
  --site-photo-chip: rgba(11, 46, 35, 0.56);
  --site-photo-chip-border: rgba(255, 255, 255, 0.26);
  --site-photo-shadow: 0 2px 22px rgba(11, 46, 35, 0.52);
  --background: #FFFFFF;
  --foreground: #0b2e23;
  --card: #FFFFFF;
  --card-foreground: #0b2e23;
  --popover: #FFFFFF;
  --popover-foreground: #0b2e23;
  --primary: #0f5a43;
  --primary-foreground: #FFFFFF;
  --secondary: #F8FAFC;
  --secondary-foreground: #0b2e23;
  --muted: #F8FAFC;
  --muted-foreground: #4e6559;
  --accent: #F59E0B;
  --accent-foreground: #0b2e23;
  --destructive: #DC2626;
  --border: #E2E8F0;
  --input: #E2E8F0;
  --ring: #10b981;
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

# 4. Write dist/site-enhancements.js (exact browser JS translation of src/lib/site-enhancements.ts)
site_enhancements_js = """(function () {
  var WEB3FORMS_KEY = "ea06d6ee-0dba-458c-9e09-39db85dfaf1a";
  var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
  var FORM_ENDPOINT = "https://api.web3forms.com/submit";
  var BACKUP_FORM_ENDPOINT = "https://formsubmit.co/ajax/reachus@suviraimmigration.com";
  var FORMSUBMIT_IO_ENDPOINT = "https://formsubmit.io/send/reachus@suviraimmigration.com";
  var THANK_YOU_PATH = "/Thank-you/";
  var probe = null;

  function parseRgb(value) {
    if (!value || value === "transparent") return null;
    if (!/^rgba?\\(/.test(value)) {
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
    var m = value.match(/rgba?\\(([^)]+)\\)/);
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
      var grad = cs.backgroundImage && cs.backgroundImage.match(/(?:rgba?|oklch|hsla?)\\([^)]+\\)/);
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
        fn.value = "SubmitForm";
        form.appendChild(fn);
      }
      form.querySelectorAll("input,select,textarea").forEach(function (field) {
        if (!field.name && field.id) field.name = field.id;
        if (!field.getAttribute("aria-label") && (!field.id || !form.querySelector('label[for="' + field.id + '"]'))) {
          field.setAttribute("aria-label", field.getAttribute("placeholder") || field.name || "Select an option");
        }
        if (field instanceof HTMLInputElement) {
          if (field.type === "email" || /email/i.test(field.name || field.id)) {
            field.autocomplete = "email";
            field.inputMode = "email";
            field.addEventListener("input", function () {
              if (this.validationMessage || (this.parentElement && this.parentElement.querySelector(".suvira-email-error-msg"))) {
                var val = this.value.trim();
                if (val && /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val)) {
                  if (typeof window.suviraClearEmailError === "function") {
                    window.suviraClearEmailError(this);
                  }
                }
              }
            });
            field.addEventListener("blur", function () {
              if (this.value.trim().length > 0) {
                if (typeof window.suviraValidateEmailInput === "function") {
                  window.suviraValidateEmailInput(this);
                }
              }
            });
          }
          if (field.type === "tel" || /phone|whatsapp/i.test(field.name || field.id)) {
            field.autocomplete = "tel";
            field.inputMode = "tel";
            field.setAttribute("pattern", "[0-9+\\\\s\\\\-()]{8,20}");
            field.setAttribute("title", "Please enter a valid country-specific phone number (no alphabets)");
            field.addEventListener("keypress", function (e) {
              if (e.key && e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                e.preventDefault();
                var msg = "Phone number cannot contain alphabets.";
                if (typeof window.suviraShowPhoneError === "function") {
                  window.suviraShowPhoneError(field, msg);
                } else {
                  field.setCustomValidity(msg);
                  field.reportValidity();
                  field.style.setProperty("border-color", "#ef4444", "important");
                  field.style.setProperty("box-shadow", "0 0 0 3px rgba(239, 68, 68, 0.25)", "important");
                }
              }
            });
            field.addEventListener("input", function () {
              if (/[a-zA-Z]/.test(this.value)) {
                this.value = this.value.replace(/[a-zA-Z]/g, "");
                var msg = "Phone number cannot contain alphabets. Please enter a valid number.";
                if (typeof window.suviraShowPhoneError === "function") {
                  window.suviraShowPhoneError(this, msg);
                } else {
                  this.setCustomValidity(msg);
                  this.reportValidity();
                  this.style.setProperty("border-color", "#ef4444", "important");
                  this.style.setProperty("box-shadow", "0 0 0 3px rgba(239, 68, 68, 0.25)", "important");
                }
              } else {
                var digits = this.value.replace(/\\D/g, "");
                if (digits.length >= 8) {
                  if (typeof window.suviraClearPhoneError === "function") {
                    window.suviraClearPhoneError(this);
                  } else {
                    this.setCustomValidity("");
                    this.style.removeProperty("border-color");
                    this.style.removeProperty("box-shadow");
                  }
                }
              }
            });
            field.addEventListener("blur", function () {
              if (!this.value.trim()) {
                if (typeof window.suviraClearPhoneError === "function") {
                  window.suviraClearPhoneError(this);
                }
                return;
              }
              if (typeof window.suviraValidatePhoneInput === "function") {
                window.suviraValidatePhoneInput(this);
              } else {
                var digits = this.value.replace(/\\D/g, "");
                if (digits.length < 10) {
                  var msg = "Please enter a valid phone number (minimum 10 digits required).";
                  this.setCustomValidity(msg);
                  this.reportValidity();
                  this.style.setProperty("border-color", "#ef4444", "important");
                  this.style.setProperty("box-shadow", "0 0 0 3px rgba(239, 68, 68, 0.25)", "important");
                }
              }
            });
          }
          if (/name/i.test(field.name)) field.autocomplete = "name";
        }
      });
    });

    // Capture all form submissions before legacy handlers and send with explicit origin Referer.
    var submit = function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !root.contains(form)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (busy.has(form)) return;

      var phone = form.querySelector('input[type="tel"], [name*="phone" i], [name*="whatsapp" i]');
      if (phone) {
        if (typeof window.suviraValidatePhoneInput === "function") {
          var ccEl = form.querySelector('[name="country_code"], #teCountryCode');
          var cc = ccEl ? ccEl.value : null;
          if (!window.suviraValidatePhoneInput(phone, cc)) {
            phone.focus();
            return;
          }
        } else {
          var raw = (phone.value || "").trim();
          var digits = raw.replace(/\\D/g, "");
          if (!raw || /[a-zA-Z]/.test(raw) || digits.length < 10) {
            var errorMsg = !raw
              ? "Please enter your phone / WhatsApp number."
              : /[a-zA-Z]/.test(raw)
              ? "Phone number cannot contain alphabets. Please enter a valid number."
              : "Please enter a valid phone number (minimum 10 digits required).";
            phone.setCustomValidity(errorMsg);
            phone.reportValidity();
            phone.style.setProperty("border-color", "#ef4444", "important");
            phone.style.setProperty("box-shadow", "0 0 0 3px rgba(239, 68, 68, 0.25)", "important");
            phone.focus();
            return;
          }
        }
      }

      var email = form.querySelector('input[type="email"], [name*="email" i]');
      if (email) {
        if (typeof window.suviraValidateEmailInput === "function") {
          if (!window.suviraValidateEmailInput(email)) {
            email.focus();
            return;
          }
        } else {
          var rawEmail = (email.value || "").trim();
          var emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
          if (!rawEmail || !emailRegex.test(rawEmail)) {
            var emailErrorMsg = !rawEmail
              ? "Please enter your email address."
              : "Please enter a valid email address (e.g., name@example.com).";
            email.setCustomValidity(emailErrorMsg);
            email.reportValidity();
            email.style.setProperty("border-color", "#ef4444", "important");
            email.style.setProperty("box-shadow", "0 0 0 3px rgba(239, 68, 68, 0.25)", "important");
            email.focus();
            return;
          }
        }
      }
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

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

      var payloadObj = {
        access_key: WEB3FORMS_KEY,
        from_name: "SubmitForm",
        Page_URL: window.location.href,
        Submitted_At: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"
      };

      // Extract all fields dynamically across all form types
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        var key = el.name || el.id;
        if (!key || el.type === "submit" || el.type === "button") return;
        var val = (el.value || "").trim();
        if (!val) return;

        if (key === "Full_Name" || key === "name" || key === "cName" || key === "eName" || key === "teName" || key === "clientName" || key === "htName" || key === "tName" || key === "Full Name") {
          payloadObj["Full_Name"] = val;
        } else if (key === "Phone_/_WhatsApp" || key === "phone" || key === "cPhone" || key === "ePhone" || key === "tePhone" || key === "clientPhone" || key === "htPhone" || key === "tPhone" || key === "Phone / WhatsApp") {
          var ccEl = form.querySelector('[name="country_code"], #teCountryCode');
          var cc = ccEl ? (ccEl.value || "").trim() : "";
          payloadObj["Phone_/_WhatsApp"] = val.indexOf("+") === 0 ? val : (cc ? (cc + " " + val) : val);
        } else if (key === "Email_Address" || key === "email" || key === "cEmail" || key === "eEmail" || key === "teEmail" || key === "clientEmail" || key === "htEmail" || key === "tEmail" || key === "Email Address") {
          payloadObj["Email_Address"] = val;
        } else if (key === "Service_Required" || key === "service" || key === "cService" || key === "visa_type" || key === "teVisa" || key === "htService" || key === "tService" || key === "Service Required") {
          payloadObj["Service_Required"] = val;
        } else if (key === "Date_of_Birth" || key === "eDob") {
          payloadObj["Date_of_Birth"] = val;
        } else if (key === "Highest_Education" || key === "eEdu" || key === "qualification") {
          payloadObj["Highest_Education"] = val;
        } else if (key === "English_Language_Test" || key === "eIelts") {
          payloadObj["English_Language_Test"] = val;
        } else if (key === "Years_of_Experience" || key === "eExp") {
          payloadObj["Years_of_Experience"] = val;
        } else if (key === "Occupation_or_Field" || key === "eOcc" || key === "occupation") {
          payloadObj["Occupation_or_Field"] = val;
        } else if (key === "Marital_Status" || key === "eMarital") {
          payloadObj["Marital_Status"] = val;
        } else if (key === "Preferred_Destination" || key === "eCountry" || key === "destination" || key === "clientCountry") {
          payloadObj["Preferred_Destination"] = val;
        } else if (key === "Visa_Category" || key === "eVisa") {
          payloadObj["Visa_Category"] = val;
        } else if (key === "Consultation_Mode" || key === "consultation_mode" || key === "teMode") {
          payloadObj["Consultation_Mode"] = val;
        } else if (key === "Message_or_Query" || key === "cMsg" || key === "eNotes" || key === "clientNotes" || key === "htMsg" || key === "tMsg" || key === "message" || key === "Questions_or_Notes" || key === "Qualifications_and_Notes") {
          payloadObj["Message_or_Query"] = val;
        } else if (key.indexOf("_") !== 0 && key !== "access_key" && key !== "country_code") {
          payloadObj[key] = val;
        }
      });

      var nameVal = payloadObj["Full_Name"] || "Website Lead";
      var serviceVal = payloadObj["Service_Required"] || payloadObj["Visa_Category"] || payloadObj["Preferred_Destination"] || "Consultation Request";
      var formName = form.id || form.getAttribute("name") || "Website Inquiry Form";
      payloadObj["Form_Source"] = formName;

      var dynamicSubject = "New Inquiry (" + serviceVal + "): " + nameVal + " [" + formName + "]";
      payloadObj["subject"] = dynamicSubject;

      // Standardized Web3Forms payload matching reachus@suviraimmigration.com exact inbox format
      var w3Data = new FormData();
      Object.keys(payloadObj).forEach(function (k) {
        w3Data.set(k, String(payloadObj[k]));
      });
      w3Data.set("redirect", thankYouUrl);

      // Aliases
      w3Data.set("Full Name", String(nameVal));
      w3Data.set("Phone / WhatsApp", String(payloadObj["Phone_/_WhatsApp"] || ""));
      w3Data.set("Email Address", String(payloadObj["Email_Address"] || ""));
      w3Data.set("Service Required", String(serviceVal));
      w3Data.set("Page URL", window.location.href);

      // 2. Save lead backup in localStorage so inquiries are NEVER lost
      try {
        var backupLeads = JSON.parse(localStorage.getItem("suvira_leads_backup") || "[]");
        var entry = Object.assign({ timestamp: new Date().toISOString() }, payloadObj);
        backupLeads.push(entry);
        localStorage.setItem("suvira_leads_backup", JSON.stringify(backupLeads.slice(-50)));
      } catch (e) {}

      // 3. Dispatch EXACTLY ONE submission to Web3Forms (prevents duplicate emails)
      try {
        fetch(WEB3FORMS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payloadObj),
          keepalive: true
        }).catch(function () {});
      } catch (err) {}

      // 4. Reset form, close modal, and re-enable buttons
      busy.delete(form);
      form.removeAttribute("aria-busy");
      buttons.forEach(function (b, idx) { b.disabled = Boolean(disabledStates[idx]); });
      status.dataset.state = "success";
      status.textContent = "Your request has been received. Thank you!";

      var onPageMsg = document.getElementById("successMsg")
        || document.getElementById("cntSuccessMsg")
        || document.getElementById("teSuccessMsg")
        || document.getElementById("htSuccess")
        || document.getElementById("touchSuccess");
      if (onPageMsg) {
        onPageMsg.style.display = "flex";
        onPageMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      }

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
      }, 500);
    };

    window.suviraSubmitLead = submit;
    document.addEventListener("submit", submit, { capture: true });

    root.querySelectorAll('a[href^="/"]').forEach(function (link) {
      link.removeAttribute("target");
      if (link.pathname.replace(/\\/+$/, "") === window.location.pathname.replace(/\\/+$/, "")) {
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
        '  <meta name="referrer" content="origin"/>',
        f'  <title>{html.escape(title)}</title>',
        '  <link rel="preconnect" href="https://fonts.googleapis.com"/>',
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>',
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap"/>',
    ]

    for meta in page.get("metas", []):
        attrs = []
        for k, v in meta.items():
            if k in ("charSet", "charset") or (k == "name" and v.lower() in ("viewport", "referrer")):
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
        .replace("https://formsubmit.co/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
        .replace("https://formsubmit.co/ajax/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
        .replace("https://formsubmit.io/send/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
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

    # Load site-enhancements.js BEFORE legacy scripts so capture-phase form handling & onsubmit removal happen immediately
    script_parts = ['  <script src="/site-enhancements.js"></script>']
    for sc in page.get("scripts", []):
        if sc.get("src"):
            script_parts.append(f'  <script src="{html.escape(sc["src"], quote=True)}"></script>')
        elif sc.get("code") or sc.get("inline"):
            code = sc.get("code") or sc.get("inline")
            code = code.replace("https://formsubmit.co/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
            code = code.replace("https://formsubmit.co/ajax/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
            code = code.replace("https://formsubmit.io/send/reachus@suviraimmigration.com", "https://api.web3forms.com/submit")
            code = code.replace("const fields = Object.assign({}, payload, {", 'const fields = Object.assign({}, payload, { access_key: "ea06d6ee-0dba-458c-9e09-39db85dfaf1a", from_name: "SubmitForm",')
            script_parts.append(f'  <script>{code}</script>')

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
        targets.append(os.path.join(DIST, "thank-you", "index.html"))
    elif route_path == "/free-eligibility-check":
        targets.append(os.path.join(DIST, "free-eligibility-check", "index.html"))
    elif route_path == "/services/study-visas":
        targets.append(os.path.join(DIST, "services", "study-visas", "index.html"))
        targets.append(os.path.join(DIST, "study-visas", "index.html"))
    elif route_path == "/services/canada-pr":
        targets.append(os.path.join(DIST, "services", "canada-pr", "index.html"))
        targets.append(os.path.join(DIST, "canada-pr", "index.html"))
        targets.append(os.path.join(DIST, "immigration-pr", "canada-pr", "index.html"))
        targets.append(os.path.join(DIST, "Immigration & PR", "canada-pr", "index.html"))
        targets.append(os.path.join(DIST, "Immigration%20&%20PR", "canada-pr", "index.html"))
    elif route_path == "/services/pr-visas":
        targets.append(os.path.join(DIST, "services", "pr-visas", "index.html"))
        targets.append(os.path.join(DIST, "pr-visas", "index.html"))
        targets.append(os.path.join(DIST, "immigration-pr", "index.html"))
        targets.append(os.path.join(DIST, "Immigration & PR", "index.html"))
        targets.append(os.path.join(DIST, "Immigration%20&%20PR", "index.html"))
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
  <meta name="referrer" content="origin"/>
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
    var bgInput = document.getElementById("background");
    var bgCount = document.getElementById("bgCount");
    var form = document.getElementById("prepForm");
    var errorEl = document.getElementById("prepError");
    var outputEl = document.getElementById("prepOutput");
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

# 7. Write dist/staticwebapp.config.json (including globalHeaders Referrer-Policy override)
with open(os.path.join(DIST, "staticwebapp.config.json"), "w", encoding="utf-8") as f:
    json.dump({
        "globalHeaders": {
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "routes": [
            {"route": "/thankyou", "rewrite": "/Thank-you/index.html"},
            {"route": "/thankyou/*", "rewrite": "/Thank-you/index.html"},
            {"route": "/thank-you", "rewrite": "/Thank-you/index.html"},
            {"route": "/thank-you/*", "rewrite": "/Thank-you/index.html"},
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

# 8. Write Cloudflare Pages _redirects and _headers
with open(os.path.join(DIST, "_redirects"), "w", encoding="utf-8") as f:
    f.write("""/thankyou /Thank-you/index.html 200
/thank-you /Thank-you/index.html 200
/Thank-you /Thank-you/index.html 200
/ai-preparation /ai-preparation/index.html 200
/free-eligibility-check /free-eligibility-check/index.html 200
/study-visas /services/study-visas/index.html 200
/study-visas/ /services/study-visas/index.html 200
/canada-pr /services/canada-pr/index.html 200
/canada-pr/ /services/canada-pr/index.html 200
/immigration-pr/canada-pr /services/canada-pr/index.html 200
/immigration-pr/canada-pr/ /services/canada-pr/index.html 200
/pr-visas /services/pr-visas/index.html 200
/pr-visas/ /services/pr-visas/index.html 200
/Immigration%20&%20PR/canada-pr /services/canada-pr 301
/Immigration%20&%20PR/canada-pr/ /services/canada-pr 301
"/Immigration & PR/canada-pr" /services/canada-pr 301
"/Immigration & PR/canada-pr/" /services/canada-pr 301
""")

with open(os.path.join(DIST, "_headers"), "w", encoding="utf-8") as f:
    f.write("""/*
  Referrer-Policy: strict-origin-when-cross-origin
  X-Content-Type-Options: nosniff
""")

# 9. Mirror static build into ROOT for Cloudflare Pages (deploying from root directory)
ROOT_PRESERVE = {".git", ".github", "src", "public", "scripts", "node_modules", "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts", "README.md", "AGENTS.md", "dist", "supabase", "Dockerfile", "nginx.conf", ".dockerignore", "buildpush"}
for item in os.listdir(DIST):
    if item in ROOT_PRESERVE:
        continue
    src_item = os.path.join(DIST, item)
    dst_item = os.path.join(ROOT, item)
    if os.path.isdir(src_item):
        if os.path.exists(dst_item):
            shutil.rmtree(dst_item)
        shutil.copytree(src_item, dst_item)
    else:
        shutil.copy2(src_item, dst_item)

# 10. Mirror scripts to src/scripts for platforms like Render configured with Root Directory = src
src_scripts = os.path.join(ROOT, "src", "scripts")
os.makedirs(src_scripts, exist_ok=True)
shutil.copy2(os.path.join(ROOT, "scripts", "build-static.py"), os.path.join(src_scripts, "build-static.py"))

# 11. Mirror dist to src/dist if Render has Root Directory = src
src_dist = os.path.join(ROOT, "src", "dist")
if os.path.exists(src_dist):
    shutil.rmtree(src_dist)
shutil.copytree(DIST, src_dist)

print("Built static dist/ and mirrored to repository root and src/ successfully.")
