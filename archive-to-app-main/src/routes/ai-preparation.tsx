import { createFileRoute, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState, useRef, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, FileCheck2, MessageCircle, AlertCircle, LoaderCircle, Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generatePreparation } from '@/lib/visa-preparation.functions';
import { INFORMATIONAL_NOTICE, preparationInput, type PreparationOutput } from '@/lib/visa-preparation';

const title = 'AI Consultation Preparation | Suvira Immigration';
const description = 'Prepare a personalized potential document checklist and consultation questions for your immigration journey. Informational only, not legal advice.';
export const Route = createFileRoute('/ai-preparation')({
  head: () => ({ meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:url', content: '/ai-preparation/' }, { name: 'twitter:card', content: 'summary' }], links: [{ rel: 'canonical', href: '/ai-preparation/' }] }),
  component: PreparationPage,
});

function PreparationPage() {
  const [destination, setDestination] = useState('');
  const [background, setBackground] = useState('');
  const [goals, setGoals] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PreparationOutput | null>(null);
  const [resultCountry, setResultCountry] = useState('');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [menu, setMenu] = useState(false);
  const generate = useServerFn(generatePreparation);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    const parsed = preparationInput.safeParse({ destination, background, goals });
    if (!parsed.success) { setError('Please enter a country, at least 20 characters of background, and 10 characters of visa goals.'); return; }
    busyRef.current = true; setBusy(true); setError('');
    try {
      const response = await generate({ data: parsed.data });
      if (response.ok) { setResult(response.preparation); setResultCountry(parsed.data.destination); setChecked(new Set()); }
      else setError(response.error);
    } catch { setError('Unable to connect. Your details are still here; please try again when ready.'); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function download() {
    if (!result) return;
    const text = `SUVIRA IMMIGRATION — CONSULTATION PREPARATION\n${resultCountry}\n\n${INFORMATIONAL_NOTICE}\n\n${result.summary}\n\nPOTENTIAL DOCUMENTS\n${result.documents.map((d,i) => `${checked.has(i) ? '[x]' : '[ ]'} ${d.name} (${d.applicability})\n${d.reason}`).join('\n\n')}\n\nCONSULTATION QUESTIONS\n${result.questions.map((q,i)=>`${i+1}. ${q}`).join('\n')}\n\nTO CONFIRM\n${result.uncertainties.join('\n')}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'suvira-consultation-preparation.txt'; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="prep-page min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Link to="/" className="flex items-center"><img src="/images/suvira-logo.png" alt="Suvira Immigration" width="94" height="94" className="size-20 object-contain md:size-24"/></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm md:flex"><Link to="/services">Visa services</Link><Link to="/ai-preparation" className="font-semibold text-primary">AI Preparation</Link><Link to="/contact">Contact us</Link><Button asChild><Link to="/free-eligibility-check">Eligibility check <ArrowRight/></Link></Button></nav>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu ? <X/> : <Menu/>}</Button>
      </div>
      {menu && <nav aria-label="Mobile navigation" className="flex flex-col gap-5 border-t border-border p-5 md:hidden"><Link to="/services">Visa services</Link><Link to="/ai-preparation" onClick={()=>setMenu(false)}>AI Preparation</Link><Link to="/contact">Contact us</Link><Link to="/free-eligibility-check">Eligibility check</Link></nav>}
    </header>
    <main className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={14}/> Back to Suvira</Link>
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_0.65fr]">
        <div><div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-primary"><Sparkles size={16}/> Consultation preparation</div><h1 className="prep-heading text-4xl leading-tight md:text-5xl">Your journey.<br/>A more prepared start.</h1><p className="mt-5 max-w-lg leading-7 text-muted-foreground">A personalized starting point for the documents and questions to bring to your immigration consultation.</p></div>
        <aside className="flex gap-3 border-l-2 border-primary bg-muted p-5 text-sm leading-6"><AlertCircle className="mt-1 shrink-0 text-primary" size={20}/><div><strong className="block mb-2">Informational only · Not legal advice</strong>{INFORMATIONAL_NOTICE}</div></aside>
      </div>
      <div className="mt-10 grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <section aria-label="Your immigration background" className="border-t border-border pt-7">
          <h2 className="prep-heading text-2xl">Tell us about your plans</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Your description is sent to AI for this request. Avoid names, passport numbers, account details, or sensitive records.</p>
          <form onSubmit={submit} className="mt-6 space-y-6">
            <fieldset disabled={busy} className="space-y-6">
              <div><label htmlFor="destination" className="mb-2 block text-sm font-medium">Destination country</label><Input id="destination" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="e.g. Canada" minLength={2} maxLength={100} required className="h-12"/></div>
              <div><label htmlFor="background" className="mb-2 block text-sm font-medium">Your background</label><Textarea id="background" value={background} onChange={e=>setBackground(e.target.value)} placeholder="Nationality, current country, education, work experience, language tests, and family situation (if relevant)." minLength={20} maxLength={2500} required rows={5}/><p className="mt-1 text-right text-xs text-muted-foreground">{background.length}/2500</p></div>
              <div><label htmlFor="goals" className="mb-2 block text-sm font-medium">Visa goals</label><Textarea id="goals" value={goals} onChange={e=>setGoals(e.target.value)} placeholder="What would you like to do? Mention your intended visa, plans, and timeline if known." minLength={10} maxLength={1500} required rows={4}/></div>
            </fieldset>
            {error && <p role="alert" className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy} className="h-12 w-full">{busy ? <LoaderCircle className="animate-spin"/> : <Sparkles/>}{busy ? 'Preparing your checklist…' : result ? 'Generate updated preparation' : 'Generate my preparation'}</Button>
          </form>
        </section>
        <section aria-label="Your preparation" aria-live="polite" aria-busy={busy} className="border-t border-border pt-7">
          {busy && <div role="status" className="mb-5 flex items-center gap-3 bg-muted p-4 text-sm"><LoaderCircle size={18} className="animate-spin"/> Personalizing documents and questions to your plans…</div>}
          {!result ? <div className="py-10"><FileCheck2 size={38} className="mb-5 text-primary" strokeWidth={1.3}/><h2 className="prep-heading text-2xl">Ready for your next step</h2><div className="mt-8 space-y-6"><div className="flex gap-4"><FileCheck2 className="text-primary"/><p className="text-sm text-muted-foreground">Potential documents, with reasons and applicability</p></div><div className="flex gap-4"><MessageCircle className="text-primary"/><p className="text-sm text-muted-foreground">Questions for your immigration adviser</p></div><div className="flex gap-4"><AlertCircle className="text-primary"/><p className="text-sm text-muted-foreground">Unknowns and requirements to confirm</p></div></div></div> : <>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-primary">AI-generated · Informational</p><h2 className="prep-heading mt-2 text-3xl">Your {resultCountry} preparation</h2></div><Button variant="outline" size="icon" onClick={download} aria-label="Download preparation" title="Download preparation"><Download/></Button></div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">{result.summary}</p>
            <h3 className="mt-8 flex items-center gap-2 font-semibold"><FileCheck2 size={18}/> Potential document checklist</h3><p className="mt-2 text-xs text-muted-foreground">{checked.size} of {result.documents.length} marked ready · Not an official filing list</p>
            <div className="mt-4 divide-y divide-border">{result.documents.map((d,i)=><label key={i} className="flex cursor-pointer items-start gap-3 py-4"><input type="checkbox" aria-label={`Mark ${d.name} ready`} checked={checked.has(i)} onChange={()=>setChecked(prev=>{const next=new Set(prev);if(next.has(i))next.delete(i);else next.add(i);return next;})} className="mt-1 size-4 accent-primary"/><div><span className="block text-sm font-semibold">{d.name}</span><span className="mt-1 block text-xs text-primary">{d.category} · {d.applicability}</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">{d.reason}</span></div></label>)}</div>
            <h3 className="mt-8 flex items-center gap-2 font-semibold"><MessageCircle size={18}/> Questions for your consultation</h3><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6">{result.questions.map((q,i)=><li key={i}>{q}</li>)}</ol>
            <div className="mt-8 bg-muted p-5"><h3 className="font-semibold">Confirm before proceeding</h3><ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground">{result.uncertainties.map((u,i)=><li key={i}>{u}</li>)}</ul></div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">{INFORMATIONAL_NOTICE}</p><Button asChild className="mt-6"><Link to="/contact">Discuss with a Suvira adviser <ArrowRight/></Link></Button>
          </>}
        </section>
      </div>
    </main>
    <footer className="prep-footer mt-12 border-t border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-8 text-sm"><Link to="/" aria-label="Suvira Immigration home"><img src="/images/suvira-logo.png" alt="Suvira Immigration" width="124" height="124" className="rounded-md bg-background p-2" loading="lazy"/></Link><div className="flex flex-wrap gap-6"><Link to="/contact">Contact us</Link><Link to="/privacy-policy">Privacy policy</Link><Link to="/disclaimer">Disclaimer</Link></div></div></footer>
  </div>;
}