import {DefaultScenarioManager} from "Leaf.lspkg/Scenarios/scenario/manager/DefaultLeafScenarioManager"

@component
export class LeafAutoRun extends BaseScriptComponent {
  @input ids: string = ""

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.runAll()
    })
  }

  private async runAll() {
    const list = this.ids
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const mgr = DefaultScenarioManager.getInstance()
    print(`[AutoRun] starting ${list.length} scenario(s)`)
    for (const id of list) {
      try {
        await mgr.startScenario(id)
        print(`[AutoRun] OK ${id}`)
      } catch (e) {
        print(`[AutoRun] ERR ${id} :: ${e}`)
      }
    }
    print(`[AutoRun] done`)
  }
}
