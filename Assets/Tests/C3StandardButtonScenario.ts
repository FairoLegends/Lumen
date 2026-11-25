import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {waitReady, grabZone, standardButton, log} from "./LumenLeafHelpers"

// C3 - real SIK interaction: lamp tapped on (so a contour exists on the desk), then pinch the UI Kit button twice.
@component
export class C3StandardButtonScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const c = await waitReady()
    const ia = new DefaultLeafInteractor()
    if (!c.lampOn) {
      await ia.trigger(grabZone("DeskLamp"))
      await sleep(400)
    }
    const t0 = c.targetLux
    const f0 = c.deskBelowTargetFraction
    await ia.trigger(standardButton())
    await sleep(500)
    const t1 = c.targetLux
    const f1 = c.deskBelowTargetFraction
    await ia.trigger(standardButton())
    await sleep(500)
    const t2 = c.targetLux
    const f2 = c.deskBelowTargetFraction
    log("C3 target " + t0 + " -> " + t1 + " -> " + t2 + ", below " + f0.toFixed(3) + " -> " + f1.toFixed(3) + " -> " + f2.toFixed(3))
    expect(t0).toBe(300)
    expect(t1).toBe(500)
    expect(t2).toBe(300)
    expect(f1).toBeGreaterThan(f0)
    expect(f2).toBeCloseTo(f0, 5)
  }
}
