import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep, nextFrame} from "Leaf.lspkg/Utils/common/Utils"
import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {waitReady, grabZone, log} from "./LumenLeafHelpers"

// C4 - lamp tapped on via SIK; head lean simulated by moving the camera object in code
// (the lens's own update loop moves the head occluder to the camera and recomputes).
@component
export class C4HeadShadowScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const c = await waitReady()
    const ia = new DefaultLeafInteractor()
    if (!c.lampOn) {
      await ia.trigger(grabZone("DeskLamp"))
      await sleep(400)
    }
    const camT = c.cameraObject.getTransform()
    const cam0 = camT.getWorldPosition()
    for (let i = 0; i < 5; i++) await nextFrame()
    const before = c.averageLux
    const shadowBefore = c.shadowActive
    const bulb = c.lampBulbPosition
    const fp = c.footprintPosition
    const mid = new vec3((bulb.x + fp.x) / 2, (bulb.y + fp.y) / 2, (bulb.z + fp.z) / 2)
    let shadow = false
    let after = before
    let head = c.headPosition
    // Device tracking rewrites the camera's local pose every frame, so offset it via a temporary parent rig.
    const origParent = c.cameraObject.getParent()
    const rig = global.scene.createSceneObject("LeafHeadLeanRig")
    rig.getTransform().setWorldPosition(mid.sub(cam0))
    c.cameraObject.setParent(rig)
    for (let i = 0; i < 15; i++) {
      await nextFrame()
      shadow = c.shadowActive
      after = c.averageLux
      head = c.headPosition
    }
    log("C4 cam " + cam0 + " -> " + mid + " head=" + head + " shadow " + shadowBefore + " -> " + shadow +
      " lux " + before.toFixed(1) + " -> " + after.toFixed(1) + " unshadowed=" + c.averageLuxUnshadowed.toFixed(1))
    c.cameraObject.setParent(origParent)
    rig.destroy()
    for (let i = 0; i < 3; i++) await nextFrame()
    expect(shadowBefore).toBe(false)
    expect(head.distance(mid) < 1).toBe(true)
    expect(shadow).toBe(true)
    expect(before).toBeGreaterThan(after)
  }
}
