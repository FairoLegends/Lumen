/**
 * LumenStandardButtonUI — the one flat standard button on the desk's front-right corner.
 * Owns: a UIKit Button (child), a label that shows the standard name + lux for
 * ~2 s after a pinch, then fades.
 * Public API: onPressed (Event), flashLabel(text), press() (programmatic, for tests).
 * Holds no standard state — LumenController owns the active target.
 */
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

@component
export class LumenStandardButtonUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LumenStandardButtonUI – standard cycle button</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Button face size (cm).")
  @widget(new SliderWidget(4, 16, 0.5))
  buttonSizeCm: number = 8

  @input
  @hint("Seconds the standard label stays visible after a pinch.")
  @widget(new SliderWidget(0.5, 6, 0.25))
  labelSeconds: number = 2

  @input
  @hint("Font size of the standard label.")
  @widget(new SliderWidget(10, 120, 2))
  labelSize: number = 34

  @input
  @hint("Unit box mesh used for the light button face.")
  faceMesh: RenderMesh

  @input
  @hint("Unlit material for the button face (cloned, tinted light).")
  faceMaterial: Material

  @input("vec3", "{1.0, 0.95, 0.8}")
  @hint("Button face fill � keep light, dark turns transparent on the additive display.")
  @widget(new ColorWidget())
  faceColor: vec3 = new vec3(1.0, 0.95, 0.8)

  @input("vec3", "{0.1, 0.14, 0.3}")
  @hint("Target value text on the button face.")
  @widget(new ColorWidget())
  valueColor: vec3 = new vec3(0.1, 0.14, 0.3)

  @input
  @hint("Font size of the target value on the face.")
  @widget(new SliderWidget(40, 400, 5))
  valueSize: number = 240
  @ui.group_end

  onPressed = new Event<void>()
  button: Button
  private label: Text
  private value: Text
  private timer = -1

  onAwake() {
    const bso = global.scene.createSceneObject("StandardButton")
    bso.setParent(this.sceneObject)
    this.button = bso.createComponent(Button.getTypeName()) as Button
    this.button.size = new vec3(this.buttonSizeCm, this.buttonSizeCm, 1.2)
    this.button.onTriggerUp.add(() => this.onPressed.invoke())

    if (this.faceMesh && this.faceMaterial) {
      const fso = global.scene.createSceneObject("StandardButtonFace")
      fso.setParent(this.sceneObject)
      fso.getTransform().setLocalPosition(new vec3(0, 0, 0.7))
      fso.getTransform().setLocalScale(new vec3(this.buttonSizeCm, this.buttonSizeCm, 0.2))
      const rmv = fso.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
      rmv.mesh = this.faceMesh
      const mat = this.faceMaterial.clone()
      mat.mainPass.baseColor = new vec4(this.faceColor.x, this.faceColor.y, this.faceColor.z, 1)
      rmv.mainMaterial = mat
    }
    const vso = global.scene.createSceneObject("StandardValue")
    vso.setParent(this.sceneObject)
    vso.getTransform().setLocalPosition(new vec3(0, 0, 0.85))
    this.value = vso.createComponent("Component.Text") as Text
    this.value.size = this.valueSize
    this.value.horizontalAlignment = HorizontalAlignment.Center
    this.value.verticalAlignment = VerticalAlignment.Center
    this.value.textFill.color = new vec4(this.valueColor.x, this.valueColor.y, this.valueColor.z, 1)
    this.value.depthTest = true

    const lso = global.scene.createSceneObject("StandardLabel")
    lso.setParent(this.sceneObject)
    lso.getTransform().setLocalPosition(new vec3(0, this.buttonSizeCm * 0.5 + 3.5, 0.5))
    this.label = lso.createComponent("Component.Text") as Text
    this.label.size = this.labelSize
    this.label.horizontalAlignment = HorizontalAlignment.Center
    this.label.verticalAlignment = VerticalAlignment.Center
    this.label.textFill.color = new vec4(1, 0.95, 0.8, 1)
    this.label.depthTest = true
    this.label.enabled = false
    this.createEvent("UpdateEvent").bind(() => this.tick())
  }

  get labelVisible(): boolean {
    return this.label.enabled
  }
  get labelText(): string {
    return this.label.text
  }

  get valueText(): string {
    return this.value.text
  }

  /** the always-visible target value on the button face, e.g. "300" */
  setValue(text: string) {
    this.value.text = text
  }

  /** programmatic press (same path as a pinch) */
  press() {
    this.onPressed.invoke()
  }

  flashLabel(text: string) {
    this.label.text = text
    this.label.enabled = true
    this.label.textFill.color = new vec4(1, 0.95, 0.8, 1)
    this.timer = 0
  }

  private tick() {
    if (this.timer < 0) return
    this.timer += getDeltaTime()
    const fade = 0.6
    const a = this.timer < this.labelSeconds ? 1 : 1 - (this.timer - this.labelSeconds) / fade
    if (a <= 0) {
      this.label.enabled = false
      this.timer = -1
      return
    }
    this.label.textFill.color = new vec4(1, 0.95, 0.8, a)
  }
}
