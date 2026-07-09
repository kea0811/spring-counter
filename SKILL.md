---
name: spring-counter
description: Use when the user wants an animated number counter in React — count up to a stat, animate a live/changing value, or add spring-physics motion to a number. React 18 or 19, client-side, zero dependencies.
---

# spring-counter

A tiny React library that animates a number toward its target using a real spring
simulation (mass / stiffness / damping) instead of a fixed-duration tween. Reach for it
when a user wants a stat that counts up, a metric that smoothly retargets when it changes,
or "make this number animate". Ships a drop-in `<SpringCounter>` component and a headless
`useSpringCounter` hook. Works under React 18 and 19, including StrictMode.

## When to reach for this

User says:
- "Make this number count up when it comes into view"
- "Animate the counter / animated stat / count-up number"
- "The dashboard number should ease to its new value, not jump"
- "Give this counter a springy / bouncy feel"

User does NOT mean this when they ask for:
- ❌ A countdown *timer* (mm:ss ticking down) — that's time, not a spring; use a timer/interval.
- ❌ An odometer/slot-machine digit-roll visual — different effect (per-digit reels).
- ❌ Animating arbitrary CSS (opacity, transforms, layout) — use a general animation lib
  (Motion, React Spring). This animates a **number's value**, then you render it.

## Install

```bash
pnpm add spring-counter
```

## Most common pattern (95% of cases)

```tsx
import { SpringCounter } from 'spring-counter';

// Counts up from 0 on mount; springs to any new `value` you pass later.
<SpringCounter value={downloads} prefix="$" locale="en-US" />
```

Need to own the markup? Use the hook:

```tsx
import { useSpringCounter } from 'spring-counter';

function Stat({ value }: { value: number }) {
  const { formatted, isAnimating } = useSpringCounter(value, { stiffness: 210, damping: 20 });
  return <span data-animating={isAnimating}>{formatted}</span>;
}
```

To count up only when scrolled into view, gate the value: `value={inView ? target : 0}` with
`from={0}` (drive `inView` with your own IntersectionObserver).

## API

Both `<SpringCounter value={n} />` and `useSpringCounter(value, options)` share these options:

| Option | Default | What it does |
| --- | --- | --- |
| `stiffness` | `170` | Spring constant — how hard it pulls to the target |
| `damping` | `26` | Bleeds off velocity; lower = bouncier, higher = no overshoot |
| `mass` | `1` | Heavier = slower to accelerate |
| `precision` | `0.01` | How close (value + velocity) counts as settled |
| `from` | `0` | Value it starts from on first mount (set to `value` to skip mount animation) |
| `decimals` | `0` | Decimal places |
| `locale` | runtime | BCP-47 locale for grouping/decimal marks |
| `prefix` / `suffix` | `''` | Wrap the number, e.g. `'$'`, `'%'`, `'+'` |
| `format` | – | Full custom `(value) => string`; overrides decimals/locale/prefix/suffix |
| `disabled` | `false` | Show the target instantly, no animation |
| `respectReducedMotion` | `true` | Honor `prefers-reduced-motion` by skipping the animation |
| `onRest` | – | Called with the target each time the spring settles |

`useSpringCounter` returns `{ current, formatted, isAnimating }`. The component also takes
`as`, `className`, `style`, and `label` (custom screen-reader text).

Also exported: `formatCounterValue(value, options)` (the same formatting as a standalone
helper) and `usePrefersReducedMotion()`.

## Gotchas worth knowing

1. `from` defaults to `0`, so a counter always counts up on mount. If you're rendering a
   value that should appear settled (e.g. it was already on screen), pass `from={value}`.
2. It's client-side: on the server / without `requestAnimationFrame` it just renders the
   value; the spring runs after hydration. Under `prefers-reduced-motion` it shows the target
   instantly by design.
3. The animated digits are `aria-hidden` and the target is announced once via a hidden label —
   don't wrap `<SpringCounter>` in your own live region or screen readers will double-read it.
4. Bouncy configs (low `damping`) overshoot, so the number briefly shows a value past the
   target. That's expected physics — raise `damping` (or use the default) if you need monotonic.

## Links

- npm / install: https://www.npmjs.com/package/spring-counter
- demo / landing: https://spring-counter.vercel.app
- repo: https://github.com/kea0811/spring-counter
