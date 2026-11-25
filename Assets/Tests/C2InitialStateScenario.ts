import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {waitReady, log} from "./LumenLeafHelpers"

// C2 - observation only (no interaction): state right after the lens reset that precedes each run.
@component
export class C2InitialStateScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const c = await waitReady()
    log("C2 lampOn=" + c.lampOn + " avg=" + c.averageLux.toFixed(2) + " target=" + c.targetLux +
      " below=" + c.deskBelowTargetFraction + " maxDesk=" + c.maxDeskLux.toFixed(1) + " readout=[" + c.readoutText + "]")
    expect(c.lampOn).toBe(false)
    expect(c.targetLux).toBe(300)
    expect(c.averageLux >= 15 && c.averageLux <= 20).toBe(true)
    expect(c.deskBelowTargetFraction).toBe(1)
    expect(c.maxDeskLux < 300).toBe(true)
    expect(c.readoutText.length).toBeGreaterThan(0)
  }
}
