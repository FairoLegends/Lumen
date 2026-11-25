/**
 * LumenDeskDraggable — pinch-drag an object across the desk plane, with a
 * short-pinch "tap" that does not move it.
 * Owns: SIK Interactable + box collider on this SceneObject, ray/desk-plane
 * projection, drag-vs-tap discrimination (moveThresholdCm).
 * Expects: bounds set by LumenController.configure(). Must not hold lighting state.
 */
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorEvent} from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event"

@component
export class LumenDeskDraggable extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LumenDeskDraggable – pinch-drag on desk, short pinch = tap</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("A pinch that moves more than this (cm) is a drag and does not count as a tap.")
  @widget(new SliderWidget(0.5, 10, 0.5))
  moveThresholdCm: number = 2

  @input
  @hint("Collider box size (cm) — the grab target. Keep generous so it is easy to aim at.")
  colliderSize: vec3 = new vec3(12, 10, 12)

  @input
  @hint("Collider centre offset from this object's origin (cm).")
  colliderCenter: vec3 = new vec3(0, 5, 0)
  @ui.group_end

  /** fires when a pinch is released without moving more than moveThresholdCm */
  onTap = new Event<void>()
  /** fires on every position change while dragging */
  onMoved = new Event<vec3>()

  private planeY = 0
  private minX = -1e6
  private maxX = 1e6
  private minZ = -1e6
  private maxZ = 1e6
  private grabOffset: vec3 | null = null
  private startPos: vec3 = vec3.zero()
  private maxMove = 0
  private _dragging = false
  private _hovered = false
  interactable: Interactable

  onAwake() {
    const zone = global.scene.createSceneObject("GrabZone")
    zone.setParent(this.sceneObject)
    zone.getTransform().setLocalPosition(this.colliderCenter)
    const col = zone.createComponent("Physics.ColliderComponent") as ColliderComponent
    const box = Shape.createBoxShape()
    box.size = this.colliderSize
    col.shape = box
    col.fitVisual = false
    this.interactable = zone.createComponent(Interactable.getTypeName()) as Interactable
    this.interactable.onHoverEnter.add(() => (this._hovered = true))
    this.interactable.onHoverExit.add(() => (this._hovered = false))
    this.interactable.onTriggerStart.add((e) => this.begin(e))
    this.interactable.onTriggerUpdate.add((e) => this.update(e))
    this.interactable.onTriggerEnd.add(() => this.end())
    this.interactable.onTriggerEndOutside.add(() => this.end())
    this.interactable.onTriggerCanceled.add(() => this.end(true))
  }

  configure(planeY: number, minX: number, maxX: number, minZ: number, maxZ: number) {
    this.planeY = planeY
    this.minX = minX
    this.maxX = maxX
    this.minZ = minZ
    this.maxZ = maxZ
  }

  get isDragging(): boolean {
    return this._dragging
  }
  get isHovered(): boolean {
    return this._hovered
  }
  get pinchActive(): boolean {
    return this.grabOffset !== null
  }

  /** programmatic move (clamped) — used by tests/scenarios */
  setDeskPosition(x: number, z: number) {
    const t = this.getTransform()
    const p = t.getWorldPosition()
    t.setWorldPosition(new vec3(this.clampX(x), p.y, this.clampZ(z)))
    this.onMoved.invoke(t.getWorldPosition())
  }

  private clampX(x: number) {
    return Math.max(this.minX, Math.min(this.maxX, x))
  }
  private clampZ(z: number) {
    return Math.max(this.minZ, Math.min(this.maxZ, z))
  }

  private rayHit(e: InteractorEvent): vec3 | null {
    const o = e.interactor.startPoint
    const d = e.interactor.direction
    if (!o || !d || Math.abs(d.y) < 1e-4) return null
    const t = (this.planeY - o.y) / d.y
    if (t <= 0) return null
    return o.add(d.uniformScale(t))
  }

  private begin(e: InteractorEvent) {
    const hit = this.rayHit(e)
    const p = this.getTransform().getWorldPosition()
    this.startPos = p
    this.maxMove = 0
    this._dragging = false
    this.grabOffset = hit ? new vec3(p.x - hit.x, 0, p.z - hit.z) : vec3.zero()
    this.lastHit = hit
  }

  private lastHit: vec3 | null = null

  private update(e: InteractorEvent) {
    if (!this.grabOffset) return
    const hit = this.rayHit(e)
    if (!hit) return
    if (!this.lastHit) {
      // first valid hit: recompute offset so the object does not jump
      const p = this.getTransform().getWorldPosition()
      this.grabOffset = new vec3(p.x - hit.x, 0, p.z - hit.z)
    }
    this.lastHit = hit
    const t = this.getTransform()
    const p = t.getWorldPosition()
    const nx = this.clampX(hit.x + this.grabOffset.x)
    const nz = this.clampZ(hit.z + this.grabOffset.z)
    const moved = Math.sqrt((nx - this.startPos.x) ** 2 + (nz - this.startPos.z) ** 2)
    this.maxMove = Math.max(this.maxMove, moved)
    if (!this._dragging && this.maxMove > this.moveThresholdCm) this._dragging = true
    if (this._dragging && (Math.abs(nx - p.x) > 1e-3 || Math.abs(nz - p.z) > 1e-3)) {
      t.setWorldPosition(new vec3(nx, p.y, nz))
      this.onMoved.invoke(t.getWorldPosition())
    }
  }

  private end(cancel = false) {
    if (!this.grabOffset) return
    const wasDrag = this._dragging
    this.grabOffset = null
    this.lastHit = null
    this._dragging = false
    if (!cancel && !wasDrag) this.onTap.invoke()
  }
}
