# spring-counter

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

> Animated number counter for React, driven by real spring physics. One hook, one component, zero dependencies.

Numbers that snap into place feel cheap. `spring-counter` animates a value the way a physical spring would — accelerating, easing in, settling — so counting up to a stat or retargeting a live number feels alive instead of linear. Tune the `stiffness`, `damping`, and `mass`, and it does the physics for you.

- 🌱 A real spring integrator, not a fixed-duration tween — retargets mid-flight with velocity intact
- 🎛️ One drop-in `<SpringCounter>` component **and** a headless `useSpringCounter` hook
- 💱 Locale-aware formatting: decimals, grouping, `prefix` / `suffix`, or your own `format()`
- ♿ Accessible by default and honors `prefers-reduced-motion`
- 🪶 Zero dependencies, TypeScript-first, works on React 18 and 19 (StrictMode included)

## For AI coding agents

Drop [`SKILL.md`](./SKILL.md) into your AI editor / Claude Code workspace and it learns how to use this library — when to reach for it, the install + canonical pattern, the public API, and the gotchas that are easy to miss.

## Install

```bash
pnpm add spring-counter
```

> _Bleeding edge or before the first npm release: `pnpm add github:kea0811/spring-counter`._

Using npm or yarn? `npm install spring-counter` / `yarn add spring-counter` work too. Requires React 18 or 19.

## Quick example

```tsx
import { SpringCounter } from 'spring-counter';

export function Downloads({ total }: { total: number }) {
  // Counts up from 0 on mount, then springs to any new `total` you pass.
  return <SpringCounter value={total} locale="en-US" />;
}
```

Change `value` at any time and the number springs from wherever it currently is to the new target — perfect for live dashboards. Want to own the markup? Use the hook:

```tsx
import { useSpringCounter } from 'spring-counter';

function Metric({ value }: { value: number }) {
  const { formatted, isAnimating } = useSpringCounter(value, { stiffness: 210, damping: 20 });
  return <span data-live={isAnimating}>{formatted}</span>;
}
```

### Count up when it scrolls into view

`spring-counter` doesn't watch the viewport for you — that's one line of your own IntersectionObserver away. Gate the target and start from zero:

```tsx
<SpringCounter value={inView ? 128540 : 0} from={0} locale="en-US" />
```

## API

### `<SpringCounter>` component

```tsx
<SpringCounter
  value={1234}          // the target number to spring toward (required)
  from={0}              // value it starts from on first mount (default 0)
  stiffness={170}       // spring constant — how hard it pulls
  damping={26}          // velocity resistance — lower is bouncier
  mass={1}              // heavier = slower to get moving
  precision={0.01}      // how close (value + velocity) counts as "settled"
  decimals={0}          // decimal places
  locale="en-US"        // BCP-47 locale for grouping / decimal marks
  prefix="$"            // text before the number
  suffix="%"            // text after the number
  format={(v) => ...}   // full custom formatter (overrides the four above)
  disabled={false}      // show the target instantly, no animation
  respectReducedMotion  // honor prefers-reduced-motion (default true)
  onRest={(v) => {}}    // fires each time the spring settles
  as="span"             // wrapper tag or component (default 'span')
  label="1,234 users"   // custom screen-reader text (defaults to formatted target)
  className="..."
  style={{}}
/>
```

### `useSpringCounter(value, options)` hook

Takes the same options (everything except `value`, which is the first argument) and returns the live state:

```ts
const {
  current,     // the live, un-rounded numeric value right now
  formatted,   // `current` run through your formatting (prefix, decimals, …)
  isAnimating, // is the spring currently in motion?
} = useSpringCounter(value, { prefix: '$', locale: 'en-US' });
```

### Spring presets, by feel

| Feel | `stiffness` | `damping` | `mass` |
| --- | --- | --- | --- |
| Gentle | `120` | `24` | `1` |
| Default | `170` | `26` | `1` |
| Snappy | `320` | `30` | `1` |
| Bouncy | `260` | `11` | `1` |
| Heavy | `180` | `26` | `4` |

Lower the `damping` for overshoot and wobble; raise the `mass` for a heavier, slower number.

### Also exported

- `formatCounterValue(value, options)` — the exact formatting the component uses, as a standalone helper for building your own labels.
- `usePrefersReducedMotion()` — the little `boolean` hook powering the reduced-motion behavior.

## Accessibility

The animated digits are hidden from assistive technology (a rapidly changing number would otherwise be announced frame by frame). In their place, the formatted **target** value is exposed as a stable, visually-hidden label — so screen readers read the destination once. Pass `label` to customize it. And if the user prefers reduced motion, the animation is skipped and the value appears at its target instantly.

## How it works (in a sentence)

A single `requestAnimationFrame` loop integrates a damped spring toward the target with a fixed physics timestep — all contained inside one `useEffect`, so it's safe under React 18 + 19 StrictMode's simulated unmount/remount cycle, and a changing `value` retargets the spring from its current position and velocity rather than restarting.

## Contributing

PRs welcome — especially new formatting helpers and spring-feel presets. Run:

```bash
pnpm install
pnpm test
pnpm build
```

The demo lives in `/demo`. `pnpm demo:dev` runs it locally.

## License

MIT © [kea0811](https://github.com/kea0811)
