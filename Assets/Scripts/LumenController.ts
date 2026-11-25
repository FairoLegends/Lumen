/**
 * LumenController — orchestrates the Lumen desk-lighting lens.
 * Owns: lighting state (lamp on/off, target lux, standard index), the illuminance
 * grid, footprint average, head-shadow state. Exposes clean getters for LEAF.
 * Expects @inputs: desk, lamp (+LumenDeskDraggable), footprint (+LumenDeskDraggable),
 * readout (LumenReadoutUI), standardButton (LumenStandardButtonUI), heatmap (LumenHeatmap),
 * ceilingLight, head (SceneObject at camera; invisible occluder), camera.
 * Must not: build UI text itself (the UI modules do), or hold view-only state.
 */
import {LumenDeskDraggable} from "./LumenDeskDraggable"
import {LumenHeatmap} from "./LumenHeatmap"
import {LumenReadoutUI} from "./LumenReadoutUI"
import {LumenStandardButtonUI} from "./LumenStandardButtonUI"
import {PointLight, Occluder, intensityCd, illuminanceAt} from "./LumenLightModel"

interface Standard {
  lux: number
  name: string
}

@component
export class LumenController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LumenController – desk illuminance estimator</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("Desk root; its world position is the centre of the desk TOP surface.")
  desk: SceneObject
  @input
  @hint("Ceiling bulb marker (fixed). Its world position is the light source.")
  ceilingLight: SceneObject
  @input
  @hint("Desk lamp root (base on desk). Has LumenDeskDraggable.")
  lamp: SceneObject
  @input
  @hint("Lamp draggable component.")
  lampDrag: LumenDeskDraggable
  @input
  @hint("Lamp shade visual — lit material when on.")
  lampShade: SceneObject
  @input
  @hint("Laptop footprint root. Has LumenDeskDraggable.")
  footprint: SceneObject
  @input
  @hint("Footprint draggable component.")
  footprintDrag: LumenDeskDraggable
  @input
  @hint("Lux readout UI on the footprint.")
  readout: LumenReadoutUI
  @input
  @hint("Standard button UI on the desk corner.")
  standardButton: LumenStandardButtonUI
  @input
  @hint("Heatmap on the desk top.")
  heatmap: LumenHeatmap
  @input
  @hint("Head occluder SceneObject (invisible sphere stand-in).")
  head: SceneObject
  @input
  @hint("Camera the head follows.")
  cameraObject: SceneObject
  @ui.group_end

  @ui.separator
  @ui.group_start("Desk & laptop")
  @input
  @hint("Desk width (cm).")
  deskWidthCm: number = 120
  @input
  @hint("Desk depth (cm).")
  deskDepthCm: number = 60
  @input
  @hint("Laptop footprint size W x D (cm).")
  footprintSizeCm: vec2 = new vec2(32, 22)
  @ui.group_end

  @ui.separator
  @ui.group_start("Lights")
  @input
  @hint("Ceiling bulb flux (lm), isotropic.")
  ceilingLumens: number = 800
  @input
  @hint("Desk lamp flux (lm).")
  lampLumens: number = 470
  @input
  @hint("Lamp bulb height above the desk (cm).")
  lampHeightCm: number = 45
  @input
  @hint("Lamp downward cone, full angle (degrees).")
  @widget(new SliderWidget(30, 170, 5))
  lampConeDeg: number = 120
  @input
  @hint("Lamp starts on (brief: off).")
  lampStartsOn: boolean = false
  @input
  @hint("Head sphere diameter (cm).")
  headDiameterCm: number = 20
  @ui.group_end

  @ui.separator
  @ui.group_start("Standards")
  @input
  @hint("Target lux values, cycled in order by the button.")
  standardLux: number[] = [300, 500]
  @input
  @hint("Names shown on the button label, same order.")
  standardNames: string[] = ["Home minimum (SNI 6197:2011)", "Reading & screen work (EN 12464-1:2021)"]
  @input
  @hint("Print state changes to the log.")
  debugLog: boolean = true
  @input
  @hint("Run a one-shot logic self-test at start (prints PASS/FAIL per done criterion, then restores state).")
  runSelfTest: boolean = false
  @ui.group_end

  // ---- state ----
  private _lampOn = false
  private _standardIndex = 0
  private _averageLux = 0
  private _averageLuxUnshadowed = 0
  private _shadowActive = false
  private _deskBelowTargetFraction = 1
  private _minDeskLux = 0
  private _maxDeskLux = 0
  private _toggleCount = 0
  private lux: Float32Array
  private blocked: Float32Array
  private shadeMat: Material
  private noteShown = false

  // ---------- public getters for LEAF ----------
  get averageLux(): number {
    return this._averageLux
  }
  /** footprint average with the head ignored */
  get averageLuxUnshadowed(): number {
    return this._averageLuxUnshadowed
  }
  get targetLux(): number {
    return this.standardLux[this._standardIndex]
  }
  get standardName(): string {
    return this.standardNames[this._standardIndex]
  }
  get standardIndex(): number {
    return this._standardIndex
  }
  get lampOn(): boolean {
    return this._lampOn
  }
  get lampToggleCount(): number {
    return this._toggleCount
  }
  get lampPosition(): vec3 {
    return this.lamp.getTransform().getWorldPosition()
  }
  get lampBulbPosition(): vec3 {
    return this.lampPosition.add(new vec3(0, this.lampHeightCm, 0))
  }
  get footprintPosition(): vec3 {
    return this.footprint.getTransform().getWorldPosition()
  }
  get shadowActive(): boolean {
    return this._shadowActive
  }
  get headPosition(): vec3 {
    return this.head.getTransform().getWorldPosition()
  }
  /** fraction (0-1) of desk heatmap cells below the target */
  get deskBelowTargetFraction(): number {
    return this._deskBelowTargetFraction
  }
  get minDeskLux(): number {
    return this._minDeskLux
  }
  get maxDeskLux(): number {
    return this._maxDeskLux
  }
  get readoutText(): string {
    return this.readout.displayedText
  }
  /** illuminance at an arbitrary desk point (x,z world cm), for tests */
  luxAt(x: number, z: number): number {
    return illuminanceAt(x, this.deskY(), z, this.lights(), this.intensities(), this.occluder()).lux
  }

  // ---------- public actions (same paths as pinches) ----------
  toggleLamp() {
    this._lampOn = !this._lampOn
    this._toggleCount++
    this.applyLampVisual()
    if (this.debugLog) print("[Lumen] lamp " + (this._lampOn ? "ON" : "OFF"))
    this.recompute()
  }
  setLampOn(on: boolean) {
    if (on !== this._lampOn) this.toggleLamp()
  }
  nextStandard() {
    this._standardIndex = (this._standardIndex + 1) % this.standardLux.length
    this.standardButton.flashLabel(this.standardName + "\n" + this.targetLux + " lx")
    this.standardButton.setValue(this.targetLux.toString())
    if (this.debugLog) print("[Lumen] target " + this.targetLux + " lx (" + this.standardName + ")")
    this.recompute()
  }
  moveLampTo(x: number, z: number) {
    this.lampDrag.setDeskPosition(x, z)
  }
  moveFootprintTo(x: number, z: number) {
    this.footprintDrag.setDeskPosition(x, z)
  }

  onAwake() {
    this._lampOn = this.lampStartsOn
    this.createEvent("OnStartEvent").bind(() => this.start())
  }

  private deskY(): number {
    return this.desk.getTransform().getWorldPosition().y
  }

  private start() {
    const d = this.desk.getTransform().getWorldPosition()
    const hw = this.deskWidthCm / 2
    const hd = this.deskDepthCm / 2
    // lamp base footprint ~ 14cm; keep the lamp base on the desk
    this.lampDrag.configure(d.y, d.x - hw + 7, d.x + hw - 7, d.z - hd + 7, d.z + hd - 7)
    const fw = this.footprintSizeCm.x / 2
    const fd = this.footprintSizeCm.y / 2
    this.footprintDrag.configure(d.y, d.x - hw + fw, d.x + hw - fw, d.z - hd + fd, d.z + hd - fd)
    this.lampDrag.onTap.add(() => this.toggleLamp())
    this.lampDrag.onMoved.add(() => this.recompute())
    this.footprintDrag.onMoved.add(() => this.recompute())
    this.standardButton.onPressed.add(() => this.nextStandard())
    this.standardButton.setValue(this.targetLux.toString())

    this.heatmap.build(this.deskWidthCm, this.deskDepthCm)
    this.lux = new Float32Array(this.heatmap.resolutionX * this.heatmap.resolutionZ)
    this.blocked = new Float32Array(this.lux.length)

    const rmv = this.lampShade.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (rmv) {
      this.shadeMat = rmv.mainMaterial.clone()
      rmv.mainMaterial = this.shadeMat
    }
    this.applyLampVisual()
    this.recompute()
    if (this.runSelfTest) this.selfTest()
    this.createEvent("UpdateEvent").bind(() => this.update())
    print(
      "[Lumen] start: ceiling-only footprint avg " +
        this._averageLux.toFixed(2) +
        " lx, target " +
        this.targetLux +
        ", desk below target " +
        (this._deskBelowTargetFraction * 100).toFixed(0) +
        "%"
    )
  }

  private lastHead: vec3 = new vec3(1e9, 0, 0)

  private update() {
    const cam = this.cameraObject.getTransform().getWorldPosition()
    this.head.getTransform().setWorldPosition(cam)
    if (cam.distance(this.lastHead) > 0.3) {
      this.lastHead = cam
      this.recompute()
    }
  }

  private applyLampVisual() {
    if (!this.shadeMat) return
    const c = this._lampOn ? new vec4(1, 0.92, 0.6, 1) : new vec4(0.35, 0.35, 0.4, 1)
    this.shadeMat.mainPass.baseColor = c
  }

  private lights(): PointLight[] {
    return [
      {pos: this.ceilingLight.getTransform().getWorldPosition(), lumens: this.ceilingLumens, coneDeg: 360, on: true},
      {pos: this.lampBulbPosition, lumens: this.lampLumens, coneDeg: this.lampConeDeg, on: this._lampOn}
    ]
  }
  private intensities(): number[] {
    return this.lights().map((l) => intensityCd(l))
  }
  private occluder(): Occluder {
    return {center: this.head.getTransform().getWorldPosition(), radius: this.headDiameterCm / 2}
  }

  private recompute() {
    if (!this.lux) return
    const lights = this.lights()
    const I = lights.map((l) => intensityCd(l))
    const occ = this.occluder()
    const d = this.desk.getTransform().getWorldPosition()
    const W = this.heatmap.resolutionX
    const H = this.heatmap.resolutionZ
    const target = this.targetLux
    let below = 0
    let mn = 1e9
    let mx = 0
    for (let iz = 0; iz < H; iz++) {
      // iz = 0 is the front edge (+z side, nearest the user)
      const z = d.z + this.deskDepthCm / 2 - ((iz + 0.5) / H) * this.deskDepthCm
      for (let ix = 0; ix < W; ix++) {
        const x = d.x - this.deskWidthCm / 2 + ((ix + 0.5) / W) * this.deskWidthCm
        const r = illuminanceAt(x, d.y, z, lights, I, occ)
        const i = iz * W + ix
        this.lux[i] = r.lux
        this.blocked[i] = r.blockedLux
        if (r.lux < target) below++
        mn = Math.min(mn, r.lux)
        mx = Math.max(mx, r.lux)
      }
    }
    this._deskBelowTargetFraction = below / (W * H)
    this._minDeskLux = mn
    this._maxDeskLux = mx

    // footprint average, 16 x 11 samples
    const f = this.footprintPosition
    const NX = 16
    const NZ = 11
    let sum = 0
    let sumU = 0
    for (let a = 0; a < NZ; a++) {
      const z = f.z - this.footprintSizeCm.y / 2 + ((a + 0.5) / NZ) * this.footprintSizeCm.y
      for (let b = 0; b < NX; b++) {
        const x = f.x - this.footprintSizeCm.x / 2 + ((b + 0.5) / NX) * this.footprintSizeCm.x
        const r = illuminanceAt(x, d.y, z, lights, I, occ)
        sum += r.lux
        sumU += r.lux + r.blockedLux
      }
    }
    this._averageLux = sum / (NX * NZ)
    this._averageLuxUnshadowed = sumU / (NX * NZ)
    const wasShadow = this._shadowActive
    this._shadowActive = this._averageLuxUnshadowed - this._averageLux > 0.5
    if (this.debugLog && wasShadow !== this._shadowActive) {
      print("[Lumen] head shadow " + (this._shadowActive ? "ON footprint" : "off"))
    }

    this.heatmap.paint(this.lux, this.blocked, target)
    this.readout.setLux(this._averageLux)
    if (!this.noteShown) {
      this.noteShown = true
      this.readout.showEstimateNote()
    }
  }

  private selfTest() {
    const r = (c: boolean) => (c ? "PASS" : "FAIL")
    const lamp0 = this.lampPosition
    const head0 = this.head.getTransform().getWorldPosition()
    const fp = this.footprintPosition
    const c2 = this._averageLux >= 15 && this._averageLux <= 20 && this._deskBelowTargetFraction === 1 && !this._lampOn
    print("[Lumen][test] C2 ceiling-only " + this._averageLux.toFixed(2) + " lx, below 100%: " + r(c2))
    this.setLampOn(true)
    this.moveLampTo(fp.x + 40, fp.z)
    const far = this._averageLux
    this.moveLampTo(fp.x + 18, fp.z)
    const near = this._averageLux
    print("[Lumen][test] C1 lamp far " + far.toFixed(1) + " -> near " + near.toFixed(1) + ": " + r(near > far))
    const t0 = this.targetLux
    const frac0 = this._deskBelowTargetFraction
    this.standardButton.press()
    const t1 = this.targetLux
    const frac1 = this._deskBelowTargetFraction
    this.standardButton.press()
    print("[Lumen][test] C3 target " + t0 + " -> " + t1 + " -> " + this.targetLux + ", below " + frac0.toFixed(3) + " -> " + frac1.toFixed(3) + ": " + r(t0 === 300 && t1 === 500 && this.targetLux === 300 && frac1 > frac0))
    // head between lamp bulb and footprint centre
    const bulb = this.lampBulbPosition
    this.head.getTransform().setWorldPosition(new vec3((bulb.x + fp.x) / 2, (bulb.y + fp.y) / 2, (bulb.z + fp.z) / 2))
    const before = this._averageLux
    this.recompute()
    print("[Lumen][test] C4 head blocks: " + before.toFixed(1) + " -> " + this._averageLux.toFixed(1) + " shadow=" + this._shadowActive + ": " + r(this._shadowActive && this._averageLux < before))
    this.head.getTransform().setWorldPosition(head0)
    this.recompute()
    const pos = this.lampPosition
    const on = this._lampOn
    this.toggleLamp()
    print("[Lumen][test] C5 tap toggles without moving: " + r(this._lampOn !== on && pos.distance(this.lampPosition) < 0.01))
    this.setLampOn(false)
    this.moveLampTo(lamp0.x, lamp0.z)
    this._toggleCount = 0
  }
}
