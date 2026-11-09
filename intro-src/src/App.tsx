/*
 * Samyak Jain · screen-share overview for a product interview.
 * UI components adapted from freedesignmd (MIT, © 2026 Tammo Elsner, https://github.com/tammo1007/freedesignmd-library):
 * SplitText, CountUpStats (Odometer), ProcessTimeline, MinimalSignoffFooter.
 * Visual tokens: freedesignmd "Linear Orbit" design system, dark mode, scaled up for video calls.
 * Layout patterns (hairline gap:1px grids, two-tone headlines, mono eyebrows, staggered reveal) borrowed from the "Forge" landing page.
 */
import { useEffect, useRef, useState } from "react";
import type React from "react";
import { SplitText } from "./SplitText";
import { Odometer, odometerCss } from "./CountUpStats";
import { ProcessTimeline, type PtlStage } from "./ProcessTimeline";
import { MinimalSignoffFooter } from "./MinimalSignoffFooter";

/* ───────── screen 1 data ───────── */

type Charter = { n: string; title: string; body: string; stat?: { value: number; prefix?: string; suffix?: string; label: string } };

const CHARTER: Charter[] = [
  { n: "01", title: "Warehouse management", body: "Sourcing to sales: tracking, monitoring and the sales channel for every device.", stat: { value: 500, suffix: "k", label: "devices a month" } },
  { n: "02", title: "ERP migration, pre‑IPO", body: "Designed and architected the Dynamics 365 integration, migrated the financial records and switched off Tally.", stat: { value: 9, label: "months, Tally to Dynamics 365" } },
  { n: "03", title: "Logistics", body: "Our own rule-based panel that ops configure. It decides where each device goes by source: forward or reverse, B2B, B2C or internal. Think Shiprocket, built in-house.", stat: { value: 150, prefix: "€", suffix: "k", label: "saved in 6 months · 10+ partners" } },
  { n: "04", title: "Grew a side business", body: "Repair: a profitable retail business. I led its revenue growth." },
];

/* ───────── screen 2 data: the device loop as a state model ───────── */

const LOOP: PtlStage[] = [
  { id: "buy", title: "Buy", place: "Pricing algorithm", time: "State: bought", status: "done", tag: "Step", leg: "Pricing → Shipex", events: [] },
  { id: "pickup", title: "Pickup", place: "Shipex logistics", time: "State: in transit", status: "done", tag: "Step", leg: "Shipex → WMS", events: [] },
  { id: "stockin", title: "Stock-in", place: "WMS + barcode registry", time: "State: in storage", status: "done", tag: "Registry", leg: "WMS → grading", events: [] },
  { id: "grade", title: "Grade + repair", place: "Rule-based grading", time: "State: graded", status: "done", tag: "Step", leg: "Grading → sales rules", events: [] },
  { id: "channel", title: "Channel", place: "Configurable sales rules", time: "State: listed, sold", status: "done", tag: "Step", leg: "Sale → finance", events: [] },
  { id: "books", title: "Books", place: "Tally → Dynamics 365", time: "State: recorded", status: "done", tag: "Step", events: [] },
];

/* ───────── screen 3 data: one migration, three decisions ───────── */

type Decision = { id: string; topic: string; did: string; instead: string; cost: string; more: string };

const DECISIONS: Decision[] = [
  {
    id: "order",
    topic: "Sequence",
    did: "Modules independent of the core first: barcoding, purchase orders, transfer lots. Web first, then the app.",
    instead: "A big-bang cutover",
    cost: "Two systems running for longer, more maintenance",
    more: "Started with a kick-off with retail and warehouse heads to map where processes overlapped, then defined new user personas.",
  },
  {
    id: "data",
    topic: "Data",
    did: "Old and new on the same database. Kibana logged which API, old or new, wrote every change.",
    instead: "A separate database plus a backfill",
    cost: "Risk of conflicting writes, managed through the logging",
    more: "We switched sub-module by sub-module. Stock-in barcoding and initial QC moved fully to the new pages, while the old pages stayed live as a fallback.",
  },
  {
    id: "time",
    topic: "Timeline",
    did: "My estimate: 9–12 months. The CTO set 6, we hit too many blockers, and 12 proved realistic.",
    instead: "A 6-month push",
    cost: "Show the risks module by module earlier, instead of defending a number",
    more: "Staffed with dedicated engineers plus some borrowed from the central team.",
  },
];

/* ───────── screen 4 data ───────── */

const QUESTIONS = [
  "Where does a device's state live today, and which system wins when warehouse and finance disagree?",
  "Which exceptions cost you most right now: stuck reservations, quarantined units, or devices that never come back?",
  "What has to be true before Black Friday, and what can wait for the new registry?",
];

/* ───────── page ───────── */

const SCREENS = [
  { id: "who", label: "Who I am" },
  { id: "loop", label: "Device loop" },
  { id: "migration", label: "Migration decisions" },
  { id: "questions", label: "Questions" },
];

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/** Reveal wrapper: blur-up with a staggered --i delay (Forge pattern). */
function Reveal({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "ol" }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  const Comp = Tag as "div";
  return <Comp ref={ref} className={`lo-rv${className ? " " + className : ""}`} data-in={seen ? "" : undefined}>{children}</Comp>;
}

function Charter() {
  const [ref, seen] = useInView<HTMLOListElement>(0.3);
  return (
    <ol className="lo-grid lo-charter lo-rv" ref={ref} data-in={seen ? "" : undefined}>
      {CHARTER.map((c, i) => (
        <li key={c.n} className="lo-cell lo-ch" style={{ ["--i" as string]: i + 1 }}>
          <span className="lo-ch-n">{c.n}</span>
          <h3 className="lo-ch-t">{c.title}</h3>
          <p className="lo-ch-b">{c.body}</p>
          {c.stat ? (
            <div className="lo-ch-stat">
              <strong className="fd-cus-value lo-ch-v"><Odometer value={c.stat.value} prefix={c.stat.prefix} suffix={c.stat.suffix} start={seen} delay={i * 120} /></strong>
              <span className="lo-ch-l">{c.stat.label}</span>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function App() {
  const [active, setActive] = useState(0);
  const loopRef = useRef<HTMLElement>(null);
  const [loopIn, setLoopIn] = useState(false);

  useEffect(() => {
    const els = SCREENS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          setActive(els.indexOf(e.target as HTMLElement));
          if ((e.target as HTMLElement).id === "loop") setLoopIn(true);
        }
      });
    }, { threshold: [0.5] });
    els.forEach((el) => io.observe(el));

    const onKey = (ev: KeyboardEvent) => {
      let dir = 0;
      if (ev.key === "ArrowDown" || ev.key === "PageDown" || ev.key === "ArrowRight") dir = 1;
      if (ev.key === "ArrowUp" || ev.key === "PageUp" || ev.key === "ArrowLeft") dir = -1;
      if (!dir) return;
      ev.preventDefault();
      const y = window.scrollY + 4;
      let cur = 0;
      els.forEach((el, i) => { if (el.offsetTop <= y + window.innerHeight * 0.4) cur = i; });
      const next = Math.max(0, Math.min(els.length - 1, cur + dir));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      els[next].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setActive(next);
    };
    window.addEventListener("keydown", onKey);
    return () => { io.disconnect(); window.removeEventListener("keydown", onKey); };
  }, []);

  const odo = (v: number, opts: { prefix?: string; suffix?: string; delay?: number } = {}) => (
    <Odometer value={v} prefix={opts.prefix} suffix={opts.suffix} delay={opts.delay} start={loopIn} />
  );

  return (
    <div className="lo">
      <style>{odometerCss}</style>
      <nav className="lo-rail" aria-label="Sections">
        {SCREENS.map((s, i) => (
          <a key={s.id} href={`#${s.id}`} aria-label={s.label} aria-current={active === i ? "step" : undefined} data-on={active === i ? "" : undefined} />
        ))}
      </nav>

      <main>
        {/* 1 · Who + charter */}
        <section className="lo-screen" id="who" aria-labelledby="who-h">
          <div className="lo-wrap">
            <Reveal>
              <p className="lo-eyebrow" style={{ ["--i" as string]: 0 }}>01 · 90-second overview</p>
              <div className="lo-who" style={{ ["--i" as string]: 1 }}>
                <div id="who-h"><SplitText as="h1" text="Samyak Jain" preset="rise" split="words" className="lo-name" trigger="mount" /></div>
                <p className="lo-role">Senior Product Manager · Berlin</p>
              </div>
              <p className="lo-lead" style={{ ["--i" as string]: 2 }}><b>7 years in product.</b> Started as a software engineer at Accenture, moved into product because I loved <em>talking to customers and solving their problems directly.</em></p>
              <h2 className="lo-h2 lo-h2-sm" style={{ ["--i" as string]: 3 }}>At Cashify, I led the supply chain pod. <span className="lo-dim">Four things in the charter.</span></h2>
            </Reveal>
            <Charter />
            <p className="lo-after">Then a few months at upGrad building AI workflows for study-abroad students.</p>
          </div>
        </section>

        {/* 2 · Device loop as a system */}
        <section className="lo-screen lo-screen-loop" id="loop" aria-label="The Cashify device loop as a state model" ref={loopRef}>
          <div className="lo-wrap lo-loop-top">
            <p className="lo-eyebrow">02 · State model</p>
          </div>
          <ProcessTimeline
            className="lo-loop"
            label={<>The Cashify device loop · who owns each step</>}
            origin="Buy"
            destination="Books"
            stats={[
              { label: "Stock-in to storage", value: <>{odo(98, { suffix: "%" })} <small>within 7 days</small></> },
              { label: "Inventory ID errors", value: <><span className="lo-from">200 →</span> {odo(0, { delay: 120 })} <small>a month</small></> },
              { label: "Devices graded", value: <><span className="lo-from">35 →</span> {odo(60, { delay: 240 })} <small>per person, per day</small></> },
            ]}
            stages={LOOP}
            progress={0}
          />
          <div className="lo-wrap lo-loop-foot">
            <p className="lo-loop-back"><span aria-hidden="true">↻</span> Books feeds back into Buy, and the loop starts again.</p>
            <p className="lo-loop-line">At Grover the same device goes round this loop more than once, which is why <b>the registry has to be the single source of truth.</b></p>
          </div>
        </section>

        {/* 3 · One migration, three decisions */}
        <section className="lo-screen" id="migration" aria-labelledby="mig-h">
          <div className="lo-wrap">
            <Reveal>
              <p className="lo-eyebrow" style={{ ["--i" as string]: 0 }}>03 · Warehouse system migration · about 2 years · module by module</p>
              <h2 className="lo-h2" id="mig-h" style={{ ["--i" as string]: 1 }}>
                <SplitText as="span" text="One migration, three decisions." preset="rise" split="words" />{" "}
                <span className="lo-dim">What I chose, and what it cost.</span>
              </h2>
            </Reveal>
            <Reveal className="lo-grid lo-decs">
              {DECISIONS.map((d, i) => (
                <article key={d.id} className="lo-cell lo-dec" style={{ ["--i" as string]: i + 1 }}>
                  <p className="lo-dec-k"><span>{String(i + 1).padStart(2, "0")}</span>{d.topic}</p>
                  <p className="lo-dec-did">{d.did}</p>
                  <dl className="lo-dec-dl">
                    <div><dt>Instead of</dt><dd>{d.instead}</dd></div>
                    <div><dt>{d.id === "time" ? "Lesson" : "Cost"}</dt><dd>{d.cost}</dd></div>
                  </dl>
                  <p className="lo-dec-more">{d.more}</p>
                </article>
              ))}
            </Reveal>
            <Reveal className="lo-grid lo-outcome">
              <div className="lo-cell" style={{ ["--i" as string]: 4 }}><span className="lo-out-k">Outcome</span><p>One source of truth across retail and warehouse</p></div>
              <div className="lo-cell" style={{ ["--i" as string]: 5 }}><span className="lo-out-k">3 steps → 1</span><p>Barcodes printed on the spot, instead of print, then scan</p></div>
            </Reveal>
          </div>
        </section>

        {/* 4 · Questions */}
        <section className="lo-screen lo-screen-q" id="questions" aria-labelledby="q-h">
          <div className="lo-wrap lo-q-body">
            <Reveal>
              <p className="lo-eyebrow" style={{ ["--i" as string]: 0 }}>04 · Over to you</p>
              <h2 className="lo-h2" id="q-h" style={{ ["--i" as string]: 1 }}>
                <SplitText as="span" text="Questions I'd bring" preset="rise" split="words" />{" "}
                <span className="lo-dim">to your asset registry.</span>
              </h2>
            </Reveal>
            <Reveal as="ol" className="lo-qs">
              {QUESTIONS.map((q, i) => (
                <li key={i} style={{ ["--i" as string]: i + 2 }}><span className="lo-q-n">{String(i + 1).padStart(2, "0")}</span><p>{q}</p></li>
              ))}
            </Reveal>
            <p className="lo-deeper">Happy to go deeper on any of this.</p>
            <p className="lo-links">
              <a href="./">Full one-pager</a>
              <a href="https://www.linkedin.com/in/samyakjain2">LinkedIn</a>
              <a href="https://drive.google.com/file/d/1ptsGfwSceJY6tIvbiGUTzeRKobrx97yi/view?usp=drive_link">Resume</a>
            </p>
          </div>
          <MinimalSignoffFooter className="lo-foot" name="Samyak Jain" practice="Senior PM" email="samyakjain372@gmail.com" city="Berlin" timeZone="Europe/Berlin" note="Thanks for your time" />
        </section>
      </main>
    </div>
  );
}
