# Disclosures

## How this was built

Lumen was planned with the [Learn AR with SPECS skill pack](https://github.com/challengepost/learn-specs).
The `plan-lens` interview produced [`design-brief.md`](design-brief.md), which was approved before any
code existed. The Lens itself was built by an AI coding agent (CLAD) driving Lens Studio through the
Lens Studio MCP, from that brief.

Every number in the README and in the demo video comes from the scene or from the LEAF scenarios.
Where a claim is not backed by a test, it is marked as unproven below.

## What is a stand-in

In the Lens Studio preview, the desk, the drawer and shelf, the ceiling fan module and the desk lamp
are generated in code at real size from measurements of my own room. They exist so the Lens can be
demonstrated without Spectacles hardware, which I do not have. `Assets/Scripts/LumenEditorOnly.ts`
hides all of them on a real device via `deviceInfoSystem.isEditor()`; on glasses these are your real
desk and your real lamps, and the Lens draws only the heatmap, the footprint and the reading.

The desk lamp is a lamp I do not own. Its defaults come from a real product (Taff LED T302, 8 W,
roughly 500 to 700 lm), and the Lens shows where such a lamp would have to sit for the desk to reach
the standard.

## What the light numbers are

Calculated, never measured. There is no light sensor in the loop. Illuminance comes from the lamp's
lumens, its cone angle and its distance to each point, using the inverse-square law with a cosine
term. Light bouncing off walls, ceiling and floor is ignored.

Checked against reality once, on my own desk, with only the ceiling light on: the model gives about
9 lux inside the laptop footprint, and a lux meter app on my phone reads 34 lux. The difference is
bounced light. The model was **not** adjusted to match the phone, because that would make the number
look accurate without being so. A phone's ambient light sensor is also uncalibrated, so 34 lux is
itself an estimate. Both are far below the 300 lx target.

## Measurements

I own no tape measure. Sizes were calibrated against my laptop's known width (ASUS TUF A15,
359.8 x 256 mm) appearing in a photograph of the desk. An earlier estimate based on hand spans was
43 % out and was discarded. The ceiling light's height and its horizontal distance from the desk
are estimates to the nearest 10 cm.

The ceiling fixture is an LED module inside a 21-inch ceiling fan. Its lumen output is not printed
on the unit and the box is lost, so 1000 lm is an estimate from comparable 12 W LED modules
(780 to 1360 lm across Loox, Signify EcoHome and Philips data sheets).

## Standards

- SNI 6197:2011, 300 lx for a work room in a home.
- EN 12464-1:2021, Table 34, row 34.2: writing, typing, reading and data processing, 500 lx required
  and up to 1000 lx modified. That row is marked as DSE work; screen reflection is named in the
  standard but is not modelled here.

Neither document is redistributed in this repository.

## Not proven

- The head-shadow interaction (criterion 4) passes as a LEAF scenario but could not be reproduced by
  moving the preview camera by hand. It is not shown in the demo video.
- Nothing has run on Spectacles hardware.
- Comfort over time, real hand tracking and real surface detection are untested by definition.

## Third-party assets

No imported images, models, fonts or audio were authored for the scene: the desk, lamp, heatmap and
text are generated in code.

What does come from elsewhere:

- `Assets/Render/Echopark.hdr`, the environment map that ships with a new Lens Studio project.
- Snap's own packages: Spectacles Interaction Kit, Spectacles UI Kit, LEAF, Bitmoji 3D and the AI
  preview agent helper. Each keeps its own licence.

The title card in the demo video was produced for this project.
