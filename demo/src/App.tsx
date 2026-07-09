import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
  type RefCallback,
} from 'react';
import { SpringCounter, type SpringCounterOptions } from 'spring-counter';

/**
 * Fires `true` (once) the moment the element scrolls into view. The whole
 * IntersectionObserver lifecycle lives inside a single `useEffect` with the node
 * tracked in state — the StrictMode-safe pattern. Falls back to visible when
 * IntersectionObserver is unavailable.
 */
function useInView<T extends Element>(): [RefCallback<T>, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback<RefCallback<T>>((n) => setNode(n), []);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node) return;
    if (typeof IntersectionObserver !== 'function') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, inView];
}

interface StatProps extends SpringCounterOptions {
  target: number;
  label: string;
  accent?: string;
}

/** A tile that counts up from 0 to `target` the first time it scrolls in. */
function Stat({ target, label, accent, ...counter }: StatProps): ReactElement {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div className="stat" ref={ref}>
      <div className="stat-value" style={accent ? { color: accent } : undefined}>
        <SpringCounter value={inView ? target : 0} from={0} {...counter} />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

interface SectionProps {
  eyebrow: string;
  title: string;
  sub: ReactNode;
  children: ReactNode;
}

function Section({ eyebrow, title, sub, children }: SectionProps): ReactElement {
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
        <p className="section-sub">{sub}</p>
      </div>
      {children}
    </section>
  );
}

const PRESETS: { name: string; note: string; config: SpringCounterOptions }[] = [
  { name: 'Gentle', note: 'soft & unhurried', config: { stiffness: 120, damping: 24 } },
  { name: 'Default', note: 'crisp, no overshoot', config: {} },
  { name: 'Snappy', note: 'quick to settle', config: { stiffness: 320, damping: 30 } },
  { name: 'Bouncy', note: 'overshoots & wobbles', config: { stiffness: 260, damping: 11 } },
  { name: 'Heavy', note: 'lumbering, high mass', config: { mass: 4, stiffness: 180, damping: 26 } },
];

function Presets(): ReactElement {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [runId, setRunId] = useState(0);
  const target = inView ? 2500 : 0;

  return (
    <div className="presets-wrap" ref={ref}>
      <div className="presets">
        {PRESETS.map((preset) => (
          <div className="preset" key={preset.name}>
            <div className="preset-value">
              <SpringCounter
                key={`${preset.name}-${runId}`}
                value={target}
                from={0}
                locale="en-US"
                {...preset.config}
              />
            </div>
            <div className="preset-name">{preset.name}</div>
            <div className="preset-note">{preset.note}</div>
          </div>
        ))}
      </div>
      <button className="replay" onClick={() => setRunId((r) => r + 1)}>
        ↻ Replay
      </button>
    </div>
  );
}

function LiveDemo(): ReactElement {
  const [value, setValue] = useState(1200);
  return (
    <div className="live">
      <div className="live-number">
        <SpringCounter value={value} from={0} locale="en-US" stiffness={210} damping={21} />
      </div>
      <div className="live-controls">
        <button onClick={() => setValue((v) => Math.max(0, v - 500))} aria-label="Subtract 500">
          −500
        </button>
        <button
          className="primary"
          onClick={() => setValue(Math.round(Math.random() * 9500) + 250)}
        >
          Randomize
        </button>
        <button onClick={() => setValue((v) => v + 500)} aria-label="Add 500">
          +500
        </button>
      </div>
      <p className="live-hint">
        Every click retargets the spring from wherever it is — velocity carried through.
      </p>
    </div>
  );
}

interface RecipeProps extends SpringCounterOptions {
  target: number;
  caption: string;
  code: string;
}

function Recipe({ target, caption, code, ...counter }: RecipeProps): ReactElement {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div className="recipe" ref={ref}>
      <div className="recipe-value">
        <SpringCounter value={inView ? target : 0} from={0} {...counter} />
      </div>
      <div className="recipe-caption">{caption}</div>
      <code className="recipe-code">{code}</code>
    </div>
  );
}

export function App(): ReactElement {
  const [heroRef, heroInView] = useInView<HTMLDivElement>();

  return (
    <div className="page">
      <header className="hero">
        <span className="hero-badge">React 18 &amp; 19 · zero deps</span>
        <h1 className="hero-title">spring-counter</h1>
        <p className="hero-tagline">
          Animated number counter for React, driven by <strong>real spring physics</strong>.
          Count up, count down, retarget mid-flight — it does the mass, stiffness and damping
          for you.
        </p>

        <div className="hero-showcase" ref={heroRef} aria-hidden="true">
          <SpringCounter
            className="hero-number"
            value={heroInView ? 128540 : 0}
            from={0}
            locale="en-US"
            stiffness={150}
            damping={22}
          />
          <span className="hero-showcase-label">downloads and climbing</span>
        </div>

        <div className="hero-install">
          <code className="install-cmd">pnpm add spring-counter</code>
        </div>
      </header>

      <main>
        <Section
          eyebrow="Drop it in"
          title="Stats that count themselves up"
          sub="Each tile springs from zero the first time it scrolls into view. Different formats, one component."
        >
          <div className="stat-grid">
            <Stat target={128540} label="Total downloads" locale="en-US" accent="#7c5cff" />
            <Stat
              target={98.6}
              label="Uptime this quarter"
              decimals={1}
              suffix="%"
              accent="#34d399"
            />
            <Stat
              target={42990}
              label="Monthly revenue"
              prefix="$"
              locale="en-US"
              accent="#22d3ee"
            />
            <Stat target={1287} label="Active projects" locale="en-US" accent="#f472b6" />
            <Stat target={4.9} label="Average rating" decimals={1} accent="#fbbf24" />
            <Stat
              target={73}
              label="Countries reached"
              suffix="+"
              stiffness={260}
              damping={16}
              accent="#a78bfa"
            />
          </div>
        </Section>

        <Section
          eyebrow="Feel the physics"
          title="Same number, five springs"
          sub="Tune stiffness, damping and mass and the motion changes character — from a gentle glide to a bouncy overshoot. All counting to 2,500."
        >
          <Presets />
        </Section>

        <Section
          eyebrow="Live values"
          title="Retarget on the fly"
          sub="When the value prop changes, the spring redirects from its current position instead of snapping. Great for dashboards and live metrics."
        >
          <LiveDemo />
        </Section>

        <Section
          eyebrow="Formatting"
          title="Currency, percentages, decimals"
          sub="Locale-aware grouping out of the box, plus prefix, suffix, decimals — or hand it your own format function."
        >
          <div className="recipe-grid">
            <Recipe
              target={2499}
              prefix="$"
              locale="en-US"
              caption="Currency"
              code={'prefix="$" locale="en-US"'}
            />
            <Recipe
              target={87.4}
              decimals={1}
              suffix="%"
              caption="Percentage"
              code={'decimals={1} suffix="%"'}
            />
            <Recipe
              target={1560000}
              caption="Compact via format()"
              code={'format={(v) => `${(v/1e6).toFixed(2)}M`}'}
              format={(v) => `${(v / 1e6).toFixed(2)}M`}
            />
            <Recipe
              target={2024}
              caption="Plain integer"
              code={'value={2024}'}
            />
          </div>
        </Section>

        <Section
          eyebrow="Accessible & considerate"
          title="Quiet for screen readers, still for reduced motion"
          sub="The animated digits are hidden from assistive tech; the final value is announced once. And prefers-reduced-motion skips the animation entirely."
        >
          <div className="note-grid">
            <div className="note">
              <div className="note-title">Announced once</div>
              <p className="note-body">
                A stable, visually-hidden label carries the target value, so screen readers read
                <span className="note-em"> “128,540” </span> — not every frame in between.
              </p>
            </div>
            <div className="note">
              <div className="note-title">Respects reduced motion</div>
              <p className="note-body">
                When the OS asks for reduced motion, the number appears at its target instantly.
                Opt out per-counter with <code className="inline-code">respectReducedMotion={'{false}'}</code>.
              </p>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Five-second integration"
          title="Install and use"
          sub="A drop-in component for the common case, or the headless hook when you own the markup."
        >
          <div className="usage">
            <pre className="code-block">
              <code>{`pnpm add spring-counter`}</code>
            </pre>
            <pre className="code-block">
              <code>{`import { SpringCounter } from 'spring-counter';

// Counts up from 0 on mount, springs to any new value.
<SpringCounter value={downloads} prefix="$" locale="en-US" />`}</code>
            </pre>
            <pre className="code-block">
              <code>{`import { useSpringCounter } from 'spring-counter';

function Stat({ value }) {
  const { formatted, isAnimating } = useSpringCounter(value, {
    stiffness: 210,
    damping: 20,
  });
  return <span data-live={isAnimating}>{formatted}</span>;
}`}</code>
            </pre>
          </div>
        </Section>
      </main>

      <footer className="footer">
        <span className="footer-name">spring-counter</span>
        <span className="footer-meta">MIT · React 18 &amp; 19 · zero dependencies</span>
      </footer>
    </div>
  );
}
