# Lumen

**How much light really lands on my desk?**

Lumen is a Lens for Spectacles that draws the light on your desk in lux, and compares it
with a published lighting standard. You place a lamp where you are thinking of putting one,
and the Lens tells you whether the surface you actually work on would reach the target.

I code and read at this desk for hours and my eyes get tired. A lux meter app gives one
number for wherever the phone happens to lie. What I wanted to know is different: **which
lamp do I need, and where do I put it**, measured against a real standard, before I buy it.

Built for [Learn AR with SPECS](https://learn-specs.devpost.com/), Round 2.

## The one spatial moment

With only the ceiling light on, my laptop's footprint gets about **9 lux** and the whole desk
is amber, meaning below target. I turn on the lamp and drag it toward the laptop. The reading
climbs past **500 lux**, the amber area shrinks back, and dragging the lamp away lets it fall
again. One flat button on the front-right corner switches the target between the two standards.

## The two targets

| Standard | Target | Where it applies |
|---|---|---|
| SNI 6197:2011 | **300 lx** | Work room in a home (Indonesia) |
| EN 12464-1:2021, Table 34, row 34.2 | **500 lx** | Writing, typing, reading, data processing (up to 1000 lx modified) |

Both are the *average* illuminance over the task area, which is why Lumen averages the light
inside the whole laptop footprint rather than reading a single point.

## The honest limits

- **The light is calculated, never measured.** There is no light sensor involved. Lumen computes
  illuminance from the lamp's lumens, its cone angle and its distance, using the inverse-square
  law with a cosine term for the angle of incidence.
- **No bounced light.** Walls, ceiling and floor reflect light that Lumen ignores. Measured on my
  own desk with only the ceiling light on: Lumen's model gives about **9 lux** at the laptop, and a
  lux meter app on my phone reads **34 lux**. The model was deliberately *not* tuned to match the
  phone. Both numbers are far under 300 lx, which is the finding that matters.
- **Preview stand-ins.** In the Lens Studio preview the desk, the ceiling module and the lamp are
  generated in code at real size, from my own room's measurements. On glasses these are your real
  desk and your real lamps, and `LumenEditorOnly.ts` hides every stand-in on a real device
  (`deviceInfoSystem.isEditor()`).
- **The lamp is one I do not own yet.** That is the point: the Lens shows where it would have to go
  and whether the desk would then reach the standard.
- **Head shadow is a sphere**, about 20 cm across at the camera position, not a head outline.
- **Hands are out of scope.** Hand shadows are not modelled.

## My room, measured

Every size was calibrated against my laptop's real width (ASUS TUF A15, 359.8 x 256 mm), because
I own no tape measure and my hand-span estimates were 43 % out before calibration.

| | Value |
|---|---|
| Desk | 101 x 86 cm |
| Laptop footprint | 36 x 25.6 cm |
| Ceiling light | LED module in a 21-inch ceiling fan, 1000 lm, 200 cm above the desk, 230 cm to the side |
| Desk lamp | Taff LED T302, 8 W, 600 lm, 120 degree cone, 50 cm above the desk |
| Standard button | 8 x 8 cm, flat, front-right corner, clear of the lit area |

Lamp lumens, cone angle and height are script inputs on `LumenController`, so you can put your
own lamp in and see what it would do.

## Open it

Requires Lens Studio 5.23.2 or newer.

1. Clone this repository and open `Lumen.esproj` in Lens Studio.
2. Wait for TypeScript compilation to finish, then open the Preview panel.
3. The Lens opens with the lamp **off**: the reading is about 9 lx and the whole desk is amber.
4. Click the lamp's base disc to turn it on. Click and drag the base to move it across the desk.
5. Drag the lamp over the laptop footprint and watch the reading cross 500 lx.
6. Click the small flat button at the desk's front-right corner to switch the standard.
7. In Interactive Preview, W/A/S/D walks, Q and E move down and up, and right-drag looks around.

## What is in here

| Path | What it is |
|---|---|
| `Assets/Scripts/LumenController.ts` | Scene wiring, standards, drag/pinch handling, script inputs |
| `Assets/Scripts/LumenLightModel.ts` | The illuminance calculation (inverse-square with cosine) |
| `Assets/Scripts/LumenHeatmap.ts` | Desk heatmap, target contour, below-target and head-shadow colours |
| `Assets/Scripts/LumenEditorOnly.ts` | Hides every preview stand-in on a real device |
| `Assets/Tests/C1..C5*.ts` | One LEAF scenario per done criterion |
| `devpost/design-brief.md` | The approved design brief, written before any code |
| `devpost/LEAF_RESULTS.md` | The five scenarios and the numbers they produced |
| `devpost/DISCLOSURES.md` | How it was built, what is a stand-in, what is not proven |

## Tests

Five LEAF scenarios, one per done criterion, all passing in one run. Numbers and the full
report are in [`devpost/LEAF_RESULTS.md`](devpost/LEAF_RESULTS.md).

## The additive display

Spectacles' display is additive, so black renders as transparent and darkening cannot be used to
show "less light". Lumen therefore marks the below-target area in **light amber** and the head
shadow in **light violet**, and `LumenHeatmap` never lets the below-target colour fall under 0.55
brightness, so it stays visible.

## Not built, on purpose

A book standing upright at the back of the desk, with its own footprint and reading, because a
lamp that lights the desk well can still leave an upright page dim. It is recorded under *Later*
in the brief. Also out: recognising real lamps, hand shadows, screen reflection, and the 750 lx
technical-drawing target.

## Licence and credits

Planned with the [Learn AR with SPECS skill pack](https://github.com/challengepost/learn-specs).
Built with CLAD, Lens Studio and the Lens Studio MCP.

Standards referenced by number only; SNI and EN documents are not redistributed here.
