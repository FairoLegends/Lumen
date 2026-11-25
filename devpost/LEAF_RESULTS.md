# LEAF results

Five scenarios, one per done criterion in [`design-brief.md`](design-brief.md). All five pass in a
single run. Every number below is produced by the scene itself, not typed in by hand.

Scene values when these were run: desk 101 x 86 cm, laptop footprint 36 x 25.6 cm, ceiling light
1000 lm at 200 cm above the desk and 230 cm to the side, desk lamp 600 lm with a 120 degree cone
at 50 cm above the desk.

| # | Criterion | Result |
|---|---|---|
| C1 | Dragging the lamp toward the footprint raises the average lux; dragging it away lowers it | 208.3 lx -> **705.9 lx** -> 138.1 lx. Checks the reading is below 500 before the drag, the lamp lands within 3 cm of the footprint centre, and the reading is above 500 after |
| C2 | With only the ceiling light on, the reading is low and the whole desk is below target | **9.03 lx** average in the footprint, 100 % of the desk below 300 lx, desk maximum 16.3 lx |
| C3 | One press on the corner button switches the target and the contour moves with it | Desk area below target 55.1 % (300 lx) -> 79.4 % (500 lx) -> 55.1 % |
| C4 | Leaning the head between lamp and footprint makes a patch appear and the number drop | 138.1 lx -> **2.7 lx** |
| C5 | A short pinch toggles the lamp without moving it; a pinch-and-drag moves it without toggling | Tap: lamp moved 0.000 cm. Drag: lamp moved 87 cm |

## What the tests do not prove

- **C4 passes in code only.** Walking the preview camera over the lamp by hand did not produce the
  violet patch, so the head shadow is **not shown in the demo video** and should be treated as
  unproven in the preview. The calculation behind it is exercised by C4; the interaction is not.
- **C5 proves the geometry of tap versus drag**, not how reliable that distinction feels with real
  hand tracking on glasses.
- Nothing here has run on Spectacles hardware. No device was available.

## A test bug worth reporting

C1 originally failed to cross 500 lx. The cause was in the test, not the Lens: the scenario added
the whole drag vector on every frame, so the lamp always overshot to the far corner of the desk.
Rewritten to step in small per-frame increments, C1 reaches the footprint centre and the reading
crosses 500 lx.

A second issue was in the scene rather than the code: six test files existed twice
(`<name> 2.ts`), declaring every class a second time. They were deleted before the run above.
