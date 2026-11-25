import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {waitReady, grabZone, log} from "./LumenLeafHelpers"

// C1 - real SIK interaction: tap lamp on, drag toward footprint, then drag away.
@component
export class C1LampDragScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const c = await waitReady()
    const ia = new DefaultLeafInteractor()
    if (!c.lampOn) {
      await ia.trigger(grabZone("DeskLamp"))
      await sleep(400)
    }
    expect(c.lampOn).toBe(true)
    const fp = c.footprintPosition
    const p0 = c.lampPosition
    const lux0 = c.averageLux
    const dx = fp.x - p0.x
    await ia.drag(grabZone("DeskLamp"), new vec3(dx * 0.6, 0, fp.z - p0.z), 1500)
    await sleep(500)
    const p1 = c.lampPosition
    const lux1 = c.averageLux
    log("C1 toward: lamp " + p0 + " -> " + p1 + ", fp " + fp + ", lux " + lux0.toFixed(1) + " -> " + lux1.toFixed(1))
    expect(Math.abs(p1.x - fp.x) < Math.abs(p0.x - fp.x)).toBe(true)
    expect(lux1).toBeGreaterThan(lux0)
    await ia.drag(grabZone("DeskLamp"), new vec3(-dx * 0.6, 0, 0), 1500)
    await sleep(500)
    const p2 = c.lampPosition
    const lux2 = c.averageLux
    log("C1 away: lamp " + p1 + " -> " + p2 + ", lux " + lux1.toFixed(1) + " -> " + lux2.toFixed(1))
    expect(Math.abs(p2.x - fp.x) > Math.abs(p1.x - fp.x)).toBe(true)
    expect(lux1).toBeGreaterThan(lux2)
  }
}
