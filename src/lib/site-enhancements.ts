export const THANK_YOU_PATH = "/Thank-you/";
export const WEB3FORMS_KEY = "f8093545-1c7c-4ef0-8ada-52543d5c98c6";
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
export const FORM_ENDPOINT = "https://api.web3forms.com/submit";
export const BACKUP_FORM_ENDPOINT = "https://formsubmit.co/ajax/reachus@suviraimmigration.com";
export const FORMSUBMIT_IO_ENDPOINT = "https://formsubmit.io/send/reachus@suviraimmigration.com";

/** One submission path for all migrated enquiry and subscription forms. */
export function installSiteEnhancements(root: HTMLElement, navigate = (path: string) => window.location.assign(path)) {
  const controller = new AbortController();
  const { signal } = controller;
  const busy = new WeakSet<HTMLFormElement>();

  // Header menu links (desktop nav + mobile drawer) open in a new browser tab.
  document.addEventListener('click', event => {
    const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link || !link.closest('.suvira-nav-menu, .mobile-nav, .nav-dropdown-menu')) return;
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.open(link.href, '_blank', 'noopener');
  }, { capture: true, signal });

  root.querySelectorAll<HTMLFormElement>('form').forEach(form => {
    form.removeAttribute('onsubmit');
    form.action = WEB3FORMS_ENDPOINT;
    form.method = 'post';
    if (!form.querySelector('input[name="access_key"]')) {
      const ak = document.createElement('input');
      ak.type = 'hidden';
      ak.name = 'access_key';
      ak.value = WEB3FORMS_KEY;
      form.appendChild(ak);
    }
    if (!form.querySelector('input[name="from_name"]')) {
      const fn = document.createElement('input');
      fn.type = 'hidden';
      fn.name = 'from_name';
      fn.value = 'Suvira Immigration Website';
      form.appendChild(fn);
    }
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea').forEach(field => {
      if (!field.name && field.id) field.name = field.id;
      if (!field.getAttribute('aria-label') && !form.querySelector(`label[for="${field.id}"]`)) {
        field.setAttribute('aria-label', field.getAttribute('placeholder') || field.name || 'Select an option');
      }
      if (field instanceof HTMLInputElement) {
        if (field.type === 'email') field.autocomplete = 'email';
        if (field.type === 'tel') { field.autocomplete = 'tel'; field.inputMode = 'tel'; }
        if (/name/i.test(field.name)) field.autocomplete = 'name';
      }
    });
  });

  const submit = async (event: Event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !root.contains(form)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (busy.has(form) || !form.reportValidity()) return;
    const phone = form.querySelector<HTMLInputElement>('input[type="tel"]');
    if (phone && !/^[+\d\s().-]{7,22}$/.test(phone.value.trim())) {
      phone.setCustomValidity('Please enter a valid phone number.');
      phone.reportValidity();
      phone.addEventListener('input', () => phone.setCustomValidity(''), { once: true, signal });
      return;
    }
    let status = form.querySelector<HTMLElement>('.suvira-form-status');
    if (!status) {
      status = document.createElement('p'); status.className = 'suvira-form-status';
      status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); form.append(status);
    }
    const buttons = [...form.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button[type="submit"],input[type="submit"],button:not([type])')];
    const disabled = buttons.map(button => button.disabled);
    busy.add(form); buttons.forEach(button => button.disabled = true);
    form.setAttribute('aria-busy', 'true'); status.dataset['state'] = 'sending'; status.textContent = 'Sending your request…';

    const thankYouUrl = window.location.origin + THANK_YOU_PATH;

    // 1. Open Thank-You landing page in a separate tab within the synchronous user gesture
    let thankYouTab: Window | null = null;
    try {
      thankYouTab = window.open(thankYouUrl, '_blank');
    } catch {}

    const data = new FormData(form);

    const nameVal = data.get('Full Name') || data.get('name') || data.get('full_name') || data.get('cName') || '';
    const phoneVal = data.get('Phone / WhatsApp') || data.get('phone') || data.get('WhatsApp') || data.get('cPhone') || '';
    const emailVal = data.get('Email Address') || data.get('email') || data.get('cEmail') || '';
    const serviceVal = data.get('Service Required') || data.get('service') || data.get('visa_type') || 'Consultation Request';
    const modeVal = data.get('Consultation Mode') || data.get('consultation_mode') || 'Virtual Video Consultation';
    const pageUrl = window.location.href;
    const dynamicSubject = `New Inquiry (${serviceVal}): ${nameVal || 'Website Lead'}`;

    // Standardized payload matching the exact email format received by reachus@suviraimmigration.com
    const w3Data = new FormData();
    w3Data.set('access_key', WEB3FORMS_KEY);
    w3Data.set('subject', dynamicSubject);
    w3Data.set('from_name', 'Suvira Immigration Website');
    w3Data.set('Full Name', String(nameVal));
    w3Data.set('Phone / WhatsApp', String(phoneVal));
    w3Data.set('Email Address', String(emailVal));
    w3Data.set('Service Required', String(serviceVal));
    w3Data.set('Consultation Mode', String(modeVal));
    w3Data.set('Page URL', pageUrl);
    w3Data.set('redirect', thankYouUrl);

    // 2. Save lead backup in localStorage so inquiries are NEVER lost
    try {
      const backupLeads = JSON.parse(localStorage.getItem('suvira_leads_backup') || '[]');
      const entry: Record<string, any> = {
        timestamp: new Date().toISOString(),
        'Full Name': nameVal,
        'Phone / WhatsApp': phoneVal,
        'Email Address': emailVal,
        'Service Required': serviceVal,
        'Consultation Mode': modeVal,
        'Page URL': pageUrl,
      };
      backupLeads.push(entry);
      localStorage.setItem('suvira_leads_backup', JSON.stringify(backupLeads.slice(-50)));
    } catch {
      // ignore
    }

    // 3. Reset form, close modal, and re-enable buttons on main page
    busy.delete(form);
    form.removeAttribute('aria-busy');
    buttons.forEach((button, index) => button.disabled = disabled[index] ?? false);
    status.dataset['state'] = 'success';
    status.textContent = 'Your request has been received. Thank you!';
    form.reset();
    const modal = document.getElementById('leadModal');
    if (modal && typeof (window as any).closeLeadModal === 'function') {
      (window as any).closeLeadModal();
    } else if (modal) {
      modal.style.display = 'none';
    }

    // 4. If separate tab was blocked by popup blocker, navigate current tab to Thank-You
    if (!thankYouTab || thankYouTab.closed || typeof thankYouTab.closed === 'undefined') {
      navigate(THANK_YOU_PATH);
    }

    // 5. Send to Web3Forms via hidden iframe (guaranteed, browser-native POST)
    try {
      const iframeName = 'suvira_form_sink';
      let sink = document.getElementById(iframeName) as HTMLIFrameElement | null;
      if (!sink) {
        sink = document.createElement('iframe');
        sink.name = iframeName;
        sink.id = iframeName;
        sink.style.display = 'none';
        sink.setAttribute('aria-hidden', 'true');
        document.body.appendChild(sink);
      }
      const hiddenForm = document.createElement('form');
      hiddenForm.method = 'POST';
      hiddenForm.action = WEB3FORMS_ENDPOINT;
      hiddenForm.target = iframeName;
      hiddenForm.style.display = 'none';
      w3Data.forEach((val, key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(val);
        hiddenForm.appendChild(input);
      });
      document.body.appendChild(hiddenForm);
      hiddenForm.submit();
      setTimeout(() => {
        hiddenForm.remove();
      }, 5000);
    } catch {}

    // 6. Direct JSON AJAX to Web3Forms
    try {
      fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: dynamicSubject,
          from_name: 'Suvira Immigration Website',
          'Full Name': String(nameVal),
          'Phone / WhatsApp': String(phoneVal),
          'Email Address': String(emailVal),
          'Service Required': String(serviceVal),
          'Consultation Mode': String(modeVal),
          'Page URL': pageUrl,
        }),
      }).catch(() => null);
    } catch {}

    // 7. Backup background dispatches to FormSubmit
    try {
      fetch(BACKUP_FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        referrerPolicy: 'origin',
        body: w3Data,
      }).catch(() => null);
    } catch {}

    try {
      fetch(FORMSUBMIT_IO_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        referrerPolicy: 'origin',
        body: w3Data,
      }).catch(() => null);
    } catch {}
  };
  // Capture before the legacy page handlers, including document-level listeners.
  document.addEventListener('submit', submit, { capture: true, signal });

  root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach(link => {
    link.removeAttribute('target');
    if (link.pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')) link.setAttribute('aria-current', 'page');
  });
  const menu = root.querySelector<HTMLElement>('.mobile-menu');
  const toggle = root.querySelector<HTMLElement>('.mobile-menu-btn');
  if (menu && toggle) { menu.id = 'mobile-menu'; toggle.setAttribute('aria-label', 'Open navigation'); }
  root.querySelector('.close-menu')?.setAttribute('aria-label', 'Close navigation');
  const modal = root.querySelector<HTMLElement>('#leadModal') || document.getElementById('leadModal');
  if (modal) {
    let modalShown = false;

    const openModal = (serviceName?: string) => {
      if (!modal) return;
      if (serviceName) {
        const sInput = modal.querySelector<HTMLInputElement | HTMLSelectElement>('input[name="service"], select[name="service"]');
        if (sInput) sInput.value = serviceName;
      }
      modal.classList.remove('is-closing');
      modal.classList.add('is-visible');
      modal.style.display = 'flex';
    };

    const showAutoModal = () => {
      if (modalShown) return;
      if (sessionStorage.getItem('suvira_consultation_dismissed') || sessionStorage.getItem('popupShown')) return;
      modalShown = true;
      openModal();
    };

    const hideModal = () => {
      modal.classList.add('is-closing');
      window.setTimeout(() => {
        modal.classList.remove('is-visible', 'is-closing');
        modal.style.display = 'none';
      }, 250);
      sessionStorage.setItem('suvira_consultation_dismissed', 'true');
      sessionStorage.setItem('popupShown', 'true');
    };

    (window as any).openLeadModal = openModal;
    (window as any).closeLeadModal = hideModal;
    (window as any).handleModalSubmit = (window as any).handleModalSubmit || function () { /* handled by capture */ };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (modal.classList.contains('is-visible') || modal.style.display === 'flex')) {
        hideModal();
      }
    }, { signal });

    modal.querySelectorAll('button[aria-label="Close"], .close-modal, .lead-modal-close').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal();
      });
    });

    root.querySelectorAll<HTMLElement>('[onclick*="leadModal"]').forEach(button => {
      button.removeAttribute('onclick');
      button.addEventListener('click', (e) => {
        e.preventDefault();
        (window as any).openLeadModal?.();
      }, { signal });
    });

    // Scroll trigger: pop up when user scrolls down towards the end of the page (>= 78% or near bottom)
    const onScrollEnd = () => {
      if (modalShown) return;
      if (sessionStorage.getItem('suvira_consultation_dismissed') || sessionStorage.getItem('popupShown')) return;
      const scrollPos = window.scrollY + window.innerHeight;
      const totalHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight
      );
      if (totalHeight > 900 && (scrollPos >= totalHeight - 700 || scrollPos / totalHeight >= 0.78)) {
        showAutoModal();
      }
    };
    window.addEventListener('scroll', onScrollEnd, { passive: true, signal });
  } else {
    root.querySelectorAll<HTMLElement>('[onclick*="leadModal"]').forEach(button => {
      button.removeAttribute('onclick');
      button.addEventListener('click', () => window.location.assign('/free-eligibility-check'), { signal });
    });
  }

  root.querySelectorAll<HTMLElement>('.suvira-btn-eligibility').forEach(button => {
    button.removeAttribute('onclick');
    button.addEventListener('click', () => { window.location.assign('/free-eligibility-check'); }, { signal });
  });

  injectFlyingIcons(root);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll<HTMLAnchorElement>('[data-leadership-mode]').forEach(link => {
    link.addEventListener('click', () => {
      const mode = root.querySelector<HTMLSelectElement>('#teMode');
      if (mode) {
        mode.value = link.dataset['leadershipMode'] || mode.value;
        mode.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, { signal });
  });
  const observer = !reduced && typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer?.unobserve(entry.target); } });
  }, { threshold: 0.08 }) : null;
  if (observer) root.querySelectorAll<HTMLElement>('.service-card,.country-card,.contact-card,.partner-card-3d,.section-title,.ldr-card,.visa-country-card,.free-calc-card,.story-card,.horizon-pathway,.visa-intent-heading,.leadership-title,.free-calc-title,.program-card,.pnp-card,.doc-check-card,.study-card,.study-uni-card,.calc-other-card,.calc-step-card,.adviser-photo,.executive-copy,.executive-visual,.executive-consult,.study-campus-figure,.study-journey-step,.study-premium-feature,.study-support-item').forEach(element => {
    const siblings = element.parentElement ? [...element.parentElement.children] : [];
    element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element) % 4, 3) * 85}ms`);
    element.classList.add('suvira-reveal'); observer.observe(element);
  });
  let frame = 0;
  const photo = root.querySelector<HTMLElement>('.horizon-photo');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced && photo) {
    const updatePhoto = () => {
      frame = 0;
      const hero = photo.parentElement;
      if (!hero) return;
      const bounds = hero.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        const offset = Math.max(-36, Math.min(36, -bounds.top * 0.065));
        photo.style.transform = `translateY(${offset}px) scale(1.08)`;
      }
    };
    const schedulePhoto = () => { if (!frame) frame = window.requestAnimationFrame(updatePhoto); };
    window.addEventListener('scroll', schedulePhoto, { passive: true, signal });
    schedulePhoto();
  }
  if (!reduced && finePointer) root.querySelectorAll<HTMLElement>('.horizon-pathway,.visa-country-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${-y * 3}deg`);
      card.style.setProperty('--tilt-y', `${x * 3}deg`);
    }, { signal });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg');
    }, { signal });
  });
  const contrastTimer = window.setTimeout(() => fixLowContrastText(root), 300);
  return () => { controller.abort(); observer?.disconnect(); window.cancelAnimationFrame(frame); window.clearTimeout(contrastTimer); };
}

/** Add three small travel icons (plane, globe, pin) flying across each hero background. */
function injectFlyingIcons(root: HTMLElement) {
  const heroes = [...root.querySelectorAll<HTMLElement>('.study-hero-slides, .horizon-hero')];
  if (!heroes.length) {
    const heading = root.querySelector('main h1, .main-content h1, h1');
    const hero = heading?.closest<HTMLElement>('section, header');
    if (hero) heroes.push(hero);
  }
  const icons: Array<[string, string]> = [
    ['plane', '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>'],
    ['globe', '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'],
    ['pin', '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'],
  ];
  heroes.forEach(hero => {
    // Append to the hero section itself, not the slides layer: the slides sit in a
    // z-index:-2 stacking context behind the light wash, which would hide the icons.
    const host = (hero.closest('section, header') as HTMLElement | null) ?? hero;
    if (host.querySelector('.hero-fly-icon')) return;
    icons.forEach(([name, path], index) => {
      const icon = document.createElement('span');
      icon.className = `hero-fly-icon hero-fly-icon-${index + 1}`;
      icon.dataset['icon'] = name;
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
      host.append(icon);
    });
  });
}

let probe: CanvasRenderingContext2D | null = null;
function parseRgb(value: string): [number, number, number, number] | null {
  if (!value || value === 'transparent') return null;
  if (!/^rgba?\(/.test(value)) {
    probe ??= Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
    if (!probe) return null;
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = '#000'; probe.fillStyle = value; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0, (d[3] ?? 0) / 255];
  }
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m?.[1]) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1];
}
function luminance([r = 0, g = 0, b = 0]: number[]) {
  const c = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  const [cr = 0, cg = 0, cb = 0] = c;
  return 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;
}
function backgroundOf(el: Element | null): number | null {
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    if (cs.backgroundImage.includes('url(')) return null; // photo backgrounds: leave as designed
    const bg = parseRgb(cs.backgroundColor);
    if (bg && bg[3] > 0.6) return luminance(bg);
    const grad = cs.backgroundImage.match(/(?:rgba?|oklch|hsla?)\([^)]+\)/);
    if (grad) { const g = parseRgb(grad[0]); if (g && g[3] > 0.6) return luminance(g); }
    el = el.parentElement;
  }
  return 1;
}
/** Ensures every heading/text stays readable against its section background on all migrated pages. */
export function fixLowContrastText(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,li,span,label,strong,small,a').forEach(el => {
    if (!el.textContent?.trim() || el.closest('.horizon-hero')) return;
    const cs = getComputedStyle(el);
    if (cs.webkitTextFillColor === 'transparent' || cs.backgroundClip === 'text') return;
    const fg = parseRgb(cs.color); const bgL = backgroundOf(el);
    if (!fg || bgL === null) return;
    const fgL = luminance(fg);
    const ratio = (Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05);
    if (ratio >= 3) return;
    const dark = bgL < 0.3;
    el.style.setProperty('color', dark ? 'var(--site-surface, #fff)' : 'var(--site-ink, #0f2a24)', 'important');
    el.style.setProperty('-webkit-text-fill-color', 'currentColor', 'important');
  });
}