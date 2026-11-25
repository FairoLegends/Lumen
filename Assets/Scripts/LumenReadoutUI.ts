/**
 * LumenReadoutUI — passive view for the lux number on the laptop footprint and the
 * one-time "Estimate, not a measurement" note.
 * Owns: two Component.Text children of this SceneObject, note fade timer.
 * Public API: setLux(n), showEstimateNote(). Holds no lighting state.
 */

@component
export class LumenReadoutUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LumenReadoutUI – lux number + estimate note</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Font size of the lux number (≈3 cm cap height at default).")
  @widget(new SliderWidget(20, 300, 2))
  luxTextSize: number = 220

  @input("vec3", "{0.95, 1.0, 1.0}")
  @hint("Lux number colour — keep light, the display is additive.")
  @widget(new ColorWidget())
  luxColor: vec3 = new vec3(0.95, 1.0, 1.0)

  @input
  @hint("Text of the disclaimer note shown with the first reading.")
  noteText: string = "Estimate, not a measurement"

  @input
  @hint("Seconds the note stays fully visible before fading.")
  @widget(new SliderWidget(1, 15, 0.5))
  noteSeconds: number = 5
  @ui.group_end

  private luxText: Text
  private note: Text
  private noteTimer = -1
  private _shown = ""

  onAwake() {
    this.luxText = this.makeText("LuxNumber", this.luxTextSize, new vec3(0, 0, 0))
    this.note = this.makeText("EstimateNote", Math.round(this.luxTextSize * 0.15), new vec3(0, -6, 0))
    this.note.text = this.noteText
    this.note.enabled = false
    this.createEvent("UpdateEvent").bind(() => this.tick())
  }

  private makeText(name: string, size: number, pos: vec3): Text {
    const so = global.scene.createSceneObject(name)
    so.setParent(this.sceneObject)
    so.getTransform().setLocalPosition(pos)
    const t = so.createComponent("Component.Text") as Text
    t.size = size
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.textFill.color = new vec4(this.luxColor.x, this.luxColor.y, this.luxColor.z, 1)
    t.depthTest = true
    return t
  }

  get displayedText(): string {
    return this._shown
  }
  get noteVisible(): boolean {
    return this.note.enabled
  }

  setLux(n: number) {
    const s = n >= 100 ? Math.round(n).toString() : n.toFixed(1)
    this._shown = s + " lx"
    this.luxText.text = this._shown
  }

  showEstimateNote() {
    this.note.enabled = true
    this.noteTimer = 0
  }

  private tick() {
    if (this.noteTimer < 0) return
    this.noteTimer += getDeltaTime()
    const fade = 1.0
    const a = this.noteTimer < this.noteSeconds ? 1 : 1 - (this.noteTimer - this.noteSeconds) / fade
    if (a <= 0) {
      this.note.enabled = false
      this.noteTimer = -1
      return
    }
    const c = this.note.textFill.color
    this.note.textFill.color = new vec4(c.x, c.y, c.z, a)
  }
}
