/**
 * LumenEditorOnly — hides the stand-in room (desk body, desk top, ceiling module)
 * on a real device, where the user's actual desk and light are visible.
 * Owns: nothing but enabling. The controller still reads these objects' transforms.
 */
@component
export class LumenEditorOnly extends BaseScriptComponent {
  @input
  @hint("Objects that exist only as a preview backdrop; disabled on device.")
  editorOnlyObjects: SceneObject[] = []

  onAwake() {
    if (global.deviceInfoSystem.isEditor()) return
    for (const o of this.editorOnlyObjects) {
      if (o) o.enabled = false
    }
  }
}
