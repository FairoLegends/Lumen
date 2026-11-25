import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {waitReady, grabZone, log} from "./LumenLeafHelpers"

// C1 - real SIK interaction: tap lamp on, drag over the footprint centre (fails then passes 500), then drag away.
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
    // LEAF's drag() adds the vector on every drag-update frame, so send a small
    // per-frame step and recalibrate frames-per-drag from the actual move.
    let frames = 40
    for (let i = 0; i < 6; i++) {
      const cur = c.lampPosition
      const off = new vec3(fp.x - cur.x, 0, fp.z - cur.z)
      if (off.length < 1.5) break
      const step = off.uniformScale(0.8 / frames)
      await ia.drag(grabZone("DeskLamp"), step, 1000)
      await sleep(500)
      const moved = c.lampPosition.sub(cur)
      const ratio = moved.length / step.length
      if (ratio > 1) frames = ratio
    }
    const p1 = c.lampPosition
    const lux1 = c.averageLux
    log("C1 toward: lamp " + p0 + " -> " + p1 + ", fp " + fp + ", lux " + lux0.toFixed(1) + " -> " + lux1.toFixed(1) + " (target 500)")
    expect(lux0).toBeLessThan(500)
    expect(new vec3(p1.x - fp.x, 0, p1.z - fp.z).length < 3).toBe(true)
    expect(lux1).toBeGreaterThan(500)
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
