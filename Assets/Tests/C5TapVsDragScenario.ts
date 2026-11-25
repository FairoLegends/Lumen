import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {waitReady, grabZone, log} from "./LumenLeafHelpers"

// C5 - real SIK interaction: short pinch (trigger) toggles without moving; pinch-drag moves without toggling.
@component
export class C5TapVsDragScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const c = await waitReady()
    const ia = new DefaultLeafInteractor()
    const on0 = c.lampOn
    const n0 = c.lampToggleCount
    const p0 = c.lampPosition
    await ia.trigger(grabZone("DeskLamp"))
    await sleep(400)
    const p1 = c.lampPosition
    log("C5 tap: on " + on0 + " -> " + c.lampOn + ", count " + n0 + " -> " + c.lampToggleCount + ", moved " + p0.distance(p1).toFixed(3))
    expect(c.lampOn).toBe(!on0)
    expect(c.lampToggleCount).toBe(n0 + 1)
    expect(p0.distance(p1) < 0.01).toBe(true)
    const on1 = c.lampOn
    const n1 = c.lampToggleCount
    await ia.drag(grabZone("DeskLamp"), new vec3(-15, 0, 0), 1500)
    await sleep(500)
    const p2 = c.lampPosition
    log("C5 drag: moved " + p1.distance(p2).toFixed(2) + " cm, on " + on1 + " -> " + c.lampOn + ", count " + n1 + " -> " + c.lampToggleCount)
    expect(p1.distance(p2)).toBeGreaterThan(2)
    expect(c.lampOn).toBe(on1)
    expect(c.lampToggleCount).toBe(n1)
  }
}
