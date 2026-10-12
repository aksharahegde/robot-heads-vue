# robot-heads-vue

A Vue 3 port, by Akshara Hegde, of [robot-heads](https://github.com/fayazara/robot-heads), the original React library created and designed by [Fayaz Ahmed](https://x.com/fayazara). It has every feature of the React version. The renderer, lighting, faces and motion are Fayaz Ahmed's original framework-free code, unchanged; only the component and the playground are rewritten for Vue.

Animated 3D robot heads for Vue. Glossy, TV-headed bots with an LED-matrix face that shows what your agent is doing — thinking, searching, listening, speaking and more — in four shapes, with a springy antenna, knob ears and a light on top that changes with the state.

Drawn on a 2D canvas: no WebGL, no runtime dependencies.

The original playground: **[robot-heads.fayaz.workers.dev](https://robot-heads.fayaz.workers.dev)**. Run this port's playground with `pnpm dev`.

## Install

```bash
npm install robot-heads-vue
```

Vue 3.3 or newer is a peer dependency.

## Quick start

```vue
<script setup lang="ts">
import { RobotHead } from 'robot-heads-vue';
defineProps<{ status: 'idle' | 'thinking' | 'speaking' }>();
</script>

<template>
  <RobotHead :state="status" :size="160" />
</template>
```

## Shapes

One head, four outlines. Every shape carries the same screen, ears, antenna, screws and back panel, and moves the same way.

```vue
<RobotHead shape="rectangle" />  <!-- the classic TV (default) -->
<RobotHead shape="square" />
<RobotHead shape="circle" />     <!-- a porthole -->
<RobotHead shape="hexagon" />    <!-- a nut, flat on top -->
```

The list is exported as `robotHeadShapes`.

## States

Each state has its own face on the screen, its own motion and its own antenna light. Switching states plays a short glitch and cross-fade, and the head eases into its new pose.

| State | Screen | Motion |
|---|---|---|
| `idle` | block eyes that blink and glance | looks around, hops now and then |
| `thinking` | heavy-lidded eyes looking up, three pulsing dots | head tilted up, switching sides; amber light pulses |
| `searching` | darting eyes, a beam sweeping the whole screen | head sweeps side to side; cyan beacon |
| `listening` | alert eyes over a live equaliser | head cocked, small nods; steady green light |
| `speaking` | a mouth that moves with the words | bobs as it talks |
| `working` | focused eyes looking down, a progress bar | busy bobbing, a hop with a spin now and then |
| `happy` | `^ ^` eyes and a smile | bouncy hops |
| `error` | red `X X` eyes | shakes its head; red light blinks |
| `sleeping` | closed eyes and rising z's | head drooped, slow breathing; light off |

The list is exported as `robotHeadStates`.

## Props

```vue
<RobotHead
  shape="rectangle"       <!-- rectangle, square, circle or hexagon -->
  state="idle"            <!-- what it is doing (above) -->
  :size="160"             <!-- px, the box the robot rests in (below) -->
  color="#2b49a3"         <!-- the shell -->
  trim-color="#93a6c8"    <!-- the ears and the antenna's collar -->
  screen-color="#e8f2ff"  <!-- the LEDs -->
  :speed="1"              <!-- multiplier on every animation -->
  :paused="false"         <!-- hold the state's still pose -->
  interactive             <!-- follow the pointer, hop and spin on a click -->
  antenna                 <!-- the antenna's stem and light; off, the knob stays -->
  floor-shadow            <!-- the soft shadow under the head -->
  :seed="0.3"             <!-- 0–1, desyncs blinks and glances in a row of heads -->
/>
```

Any other attribute (`class`, `style`, `@click`, `aria-label`, …) falls through to the element. A template ref reaches the component, and its exposed `canvas` is the `<canvas>` inside:

```vue
<script setup lang="ts">
import { ref } from 'vue';
const bot = ref<{ canvas: HTMLCanvasElement } | null>(null);
</script>
<template><RobotHead ref="bot" /></template>
```

## Sizing and layout

`size` is the robot itself: the element is a `size` × `size` box with the robot at rest centred in it, filling it, antenna included. It lines up with text, sits in a flex row, and centres like an icon or an avatar would.

Its motion is not part of that box. Hops, the antenna's glow and the floor's shadow draw past its edges — like a CSS `box-shadow`, they overflow without taking any room in your layout, and only the box takes clicks. So margins, flex and grid treat it as exactly `size` × `size`; the one thing to watch is a parent with `overflow: hidden` right round it, which would cut off a hop.

## Behaviour

- **Pointer play.** With `interactive` on (the default), the head and eyes follow a nearby pointer, and a click makes it hop with a full spin and a happy face.
- **Small sizes.** For avatars in a list, `antenna={false}` drops the antenna's stem and its light, keeping the knob on top, so the head itself fills more of the box (the square, circle and hexagon grow; the wide rectangle is already as big as its width allows).
- **Reduced motion.** With `prefers-reduced-motion: reduce`, or `paused`, the still pose of the state is drawn instead of the animation.
- **Accessible by default.** The canvas has `role="img"` and an `aria-label` naming the state ("Robot, thinking"); pass your own `aria-label` to override it.
- **Cheap to run many.** Every head on the page shares one animation loop, which sleeps while the tab is hidden, and heads of the same shape and size share their baked textures.

## How it is drawn

The head is real geometry: a shell with a rolled edge — its outline a convex polygon of corner centres grown by a corner radius, so one builder makes every shape — lathed knob ears and an antenna collar, built once as quad meshes. Each frame it is turned with the pose and projected, back faces are culled, and every quad is lit by a small studio model: a key light, a fill, a sky dome, a softbox and the key's window caught as clear-coat reflections with Fresnel, a cool back light rimming the silhouette, and a filmic tone curve.

The flat front and back are plates drawn in their own plane with baked relief: the lip rolling into the screen hole, the rubber gasket, the shadow the lip casts onto the glass, screws, and vents on the back. The glass sits a little behind the bezel, so it slides against it as the head turns. The LED matrix covers the whole screen, the face centred on it; the LEDs are drawn crisp, then bloomed from a one-pixel-per-LED image scaled up smooth. The antenna is a damped spring that whips when the head hops, lands or tilts, topped with a frosted bulb lit from inside.

## Development

```bash
pnpm install
pnpm run dev              # the playground (Vite)
pnpm run test             # vitest: core maths, sim and component behaviour
pnpm run typecheck
pnpm run build            # the library, to dist/
pnpm run build:playground
```

```
src/            the library
  RobotHead.ts    the Vue component
  tv/             the TV head: geometry, lighting, faces, motion, renderer (framework-free)
playground/     the playground (Vue + Vite)
tests/          vitest suites
```

## License

[MIT](LICENSE) © [Fayaz Ahmed](https://x.com/fayazara) (original robot-heads), © Akshara Hegde (Vue port).

The playground is set in [Open Runde](https://github.com/lauridskern/open-runde) by Laurids Kern, under the SIL Open Font License 1.1 (`playground/public/fonts/OFL.txt`). The font is not part of the npm package.
