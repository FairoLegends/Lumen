---
status: approved
---

# Design brief: Lumen

## The one spatial moment
I'm sitting at my desk. I drag the desk lamp across the desk and watch the light land on the surface at real size. The average lux inside my laptop footprint rises or falls against the target, and the contour line where the light meets the target moves with it.

## Why it belongs on glasses
- Uses: draws in the world (light drawn on the desk at real size, with the number sitting where the laptop sits); leaves your body free (both hands stay on the keyboard, one quick pinch to switch the standard).
- Why it's better than the phone or laptop version: a lux meter or simulator on a screen gives one number or a top-down diagram. Here the light pattern, the under-target area and the shadow of my own head sit on the surface I actually work on, from where I sit.

## Product or overlay
- Type: overlay in intent (my real lamps and desk), built as a product in the preview.
- What the real version would sense: no lamp recognition. On the glasses I pinch my real lamps to place them, the desk surface comes from the glasses' surface detection, and my head position comes from the camera. Light is never sensed, only calculated.
- Stand-in for the preview: a virtual desk and two virtual lamps at real size. The desk lamp is dragged with the mouse instead of moving a real lamp. My head is a sphere about 20 cm across at the camera position. All lux values are estimates calculated from the lamp values, not measurements; the Lens should say so in small text near the reading the first time it appears.

## Where things live
- Where the user is looking during the main task: down at the desk surface, mainly the laptop footprint on the left.
- Desk: a virtual desk surface about 120 x 60 cm (default), top about 75 cm above the floor (default), in front of the user at start, about 40 cm away (default).
- Ceiling light: 9 W LED bulb, about 800 lumens, bare, spreading light in all directions, about 200 cm above the desk, above the desk centre (default position). Fixed, not draggable (default).
- Desk lamp: shaded, pointing down. 5 W LED, about 470 lumens (default), about 45 cm above the desk (default), downward cone about 120° wide (default). Draggable across the desk. Starts on the right half of the desk (default).
- Laptop footprint: one flat footprint the size of my laptop, about 32 x 22 cm (default), lying on the desk. Starts on the left side of the desk, not the centre. Draggable the same way as the lamp.
- Lux reading: the average illuminance inside the laptop footprint, as a light-coloured number lying on or just above the footprint, readable from the seat, text about 3 cm tall (default).
- Light on the desk: a heatmap of illuminance over the whole desk surface, one contour line where the light equals the target, and the area below the target marked with a distinct light colour (default: light amber), never by darkening, since dark content turns transparent on the additive display.
- Standard button: one large flat button, about 8 x 8 cm (default), on the front-right corner of the desk, opposite the laptop and clear of the lit area.
- Head: a sphere about 20 cm across at the camera position, invisible, used only to block light. Its shadow on the desk is drawn in its own distinct light colour (default: light violet), not darkened.

## Hands and input
- Drag the desk lamp: pinch and drag to move it across the desk. The light, contour and number update live.
- Toggle the desk lamp: a short pinch on the lamp, released without moving it, turns it on or off. A pinch that moves more than about 2 cm (default) is a drag and does not toggle. If this proves unreliable in the preview, fall back to: pinching the lamp's shade toggles, pinching and dragging the lamp base moves it (still no second button).
- Drag the laptop footprint: pinch and drag, same as the lamp.
- Standard button: one pinch moves to the next standard in a fixed order, then loops back: Home minimum, 300 lx (SNI 6197:2011) → Reading and screen work, 500 lx (EN 12464-1:2021, Table 34 row 34.2) → back to 300.
- Head shadow: walk or lean (WASD, Q/E) between the desk lamp and the footprint.
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Lens opens with the desk lamp off: the first thing I see is the ceiling light alone, about 15 to 20 lux, with the whole desk below target. Starting target: 300 lx (default).
- Active standard: shown by the desk itself (the contour line and the light amber area move), not by a label in view all the time. The button may briefly show the standard's name and lux value for about 2 seconds (default) after a pinch, then fade.
- Lux number: always shown on the footprint while it's on the desk, since it is the core reading.
- "Estimate, not a measurement" note: shows with the first reading, then fades after a few seconds (default).
- If something needs attention out of view: none.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Dragging the desk lamp toward my laptop footprint raises the average lux inside it, and dragging it away lowers it. (The video moment.)
2. With only the ceiling light on, the number sits around 15 to 20 lux and the whole desk is below the target. The Lens opens in this state, with the desk lamp off.
3. One pinch on the corner button switches the target between 300 and 500 lx, and the contour line on the desk moves with it.
4. Leaning my head between the desk lamp and the footprint makes a coloured patch appear and the number drop.
5. A short pinch on the desk lamp turns it on or off without moving it; a pinch-and-drag moves it without toggling.

## Out of scope
- Recognizing my real lamps and desk.
- Shadows of my hands.
- A third standard (technical drawing, 750 lx) or the 1,000 lx upper value.
- Later: the book standing upright against the wall at the back of the desk, with its own upright footprint and lux reading, because a lamp that lights the desk well can leave an upright page dim.

## Risks and open questions
- Desk lamp bulb, height and cone are defaults; I'll replace them after I check. The ceiling height is a rough estimate (no tape measure).
- Telling a short pinch apart from a drag in the preview may be unreliable; fallback described under Hands and input.
- The head shadow is a sphere, not a head outline.
- Lux values are a simple calculation (inverse-square with cosine, point sources), not a measurement; no light bouncing off walls, so real readings will be somewhat higher.
- Deadline: 7 December, solo, alongside another project. Get criterion 1 working first.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
