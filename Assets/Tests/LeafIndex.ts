import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {C1LampDragScenario} from "./C1LampDragScenario"
import {C2InitialStateScenario} from "./C2InitialStateScenario"
import {C3StandardButtonScenario} from "./C3StandardButtonScenario"
import {C4HeadShadowScenario} from "./C4HeadShadowScenario"
import {C5TapVsDragScenario} from "./C5TapVsDragScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "c1-lamp-drag", typename: C1LampDragScenario.getTypeName()},
    {id: "c2-initial-state", typename: C2InitialStateScenario.getTypeName()},
    {id: "c3-standard-button", typename: C3StandardButtonScenario.getTypeName()},
    {id: "c4-head-shadow", typename: C4HeadShadowScenario.getTypeName()},
    {id: "c5-tap-vs-drag", typename: C5TapVsDragScenario.getTypeName()},
  ]
}
