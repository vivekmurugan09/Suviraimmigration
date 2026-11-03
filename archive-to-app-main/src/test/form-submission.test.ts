import { afterEach, describe, expect, it, vi } from 'vitest';
import { FORM_ENDPOINT, installSiteEnhancements } from '@/lib/site-enhancements';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = ''; });

describe('Migrated enquiry forms', () => {
  it('opens /thankyou only after the service accepts the submission', async () => {
    document.body.innerHTML = '<div id="root"><form><input name="name" value="Test enquiry"><button type="submit">Send</button></form></div>';
    const root = document.getElementById('root');
    const form = root?.querySelector('form');
    if (!root || !form) throw new Error('Missing test form');
    let accept: ((value: unknown) => void) | undefined;
    vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => { accept = resolve; })));
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const navigate = vi.fn();
    const cleanup = installSiteEnhancements(root, navigate);
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(navigate).not.toHaveBeenCalled();
    accept?.({ ok: true, json: async () => ({ success: true }) });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledExactlyOnceWith('/thankyou'));
    cleanup();
  });
  it('sends one request to the Suvira email endpoint and keeps input on rejection', async () => {
    document.body.innerHTML = '<div id="root"><form onsubmit="throw new Error(\'legacy handler\')"><input name="name" value="Test enquiry"><input name="email" type="email" value="test@example.com"><button type="submit">Send</button></form></div>';
    const root = document.getElementById('root');
    if (!root) throw new Error('Missing root');
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) });
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const cleanup = installSiteEnhancements(root);
    const form = root.querySelector('form');
    if (!form) throw new Error('Missing form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(form.getAttribute('aria-busy')).toBeNull());
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0]?.[0]).toBe('https://formsubmit.co/ajax/reachus@suviraimmigration.com');
    expect(FORM_ENDPOINT).toBe('https://formsubmit.co/ajax/reachus@suviraimmigration.com');
    expect(form.querySelector<HTMLInputElement>('[name="name"]')?.value).toBe('Test enquiry');
    expect(form.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
    cleanup();
  });
});