import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {getInteractables} from "Leaf.lspkg/Interactors/InteractableUtils"
import {LumenController} from "../Scripts/LumenController"

export function lumen(): LumenController {
  const so = findSceneObjectByName("Lumen")
  if (!so) throw new Error("SceneObject 'Lumen' not found")
  const c = so.getComponent(LumenController.getTypeName()) as LumenController
  if (!c) throw new Error("LumenController not found on 'Lumen'")
  return c
}

export function grabZone(parentName: string): any {
  const it = getInteractables().find(
    (i) => i.getSceneObject().name === "GrabZone" && i.getSceneObject().getParent()?.name === parentName
  )
  if (!it) throw new Error("GrabZone under " + parentName + " not found")
  return it
}

export function standardButton(): any {
  const it = getInteractables().find((i) => i.getSceneObject().name === "StandardButton")
  if (!it) throw new Error("StandardButton interactable not found")
  return it
}

export async function waitReady(): Promise<LumenController> {
  for (let i = 0; i < 40; i++) {
    try {
      const c = lumen()
      grabZone("DeskLamp")
      standardButton()
      return c
    } catch (e) {
      await sleep(100)
    }
  }
  return lumen()
}

export function log(msg: string) {
  print("[LumenLEAF] " + msg)
}
