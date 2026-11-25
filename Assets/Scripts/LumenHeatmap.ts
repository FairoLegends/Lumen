/**
 * LumenHeatmap — draws the illuminance heatmap on the desk top.
 * Owns: a MeshBuilder quad (desk size) + a procedural RGBA texture it repaints.
 * Colour rules (additive display — never darken):
 *   at/above target  -> light teal-white, brighter with more light
 *   below target     -> light amber
 *   head shadow      -> light violet
 *   target contour   -> near-white line
 * Expects: material (unlit, base texture). Must not own lighting state — the
 * controller passes lux/blocked arrays in.
 */

@component
export class LumenHeatmap extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">LumenHeatmap – desk illuminance texture</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("Unlit material with a base texture slot; the procedural heatmap is assigned to it.")
  material: Material
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Heatmap texels across the desk width.")
  @widget(new SliderWidget(24, 160, 4))
  resolutionX: number = 96

  @input
  @hint("Heatmap texels across the desk depth.")
  @widget(new SliderWidget(12, 80, 2))
  resolutionZ: number = 48

  @input("vec3", "{1.0, 0.78, 0.42}")
  @hint("Colour of desk area below the target (light amber).")
  @widget(new ColorWidget())
  belowColor: vec3 = new vec3(1.0, 0.78, 0.42)

  @input("vec3", "{0.55, 0.95, 0.9}")
  @hint("Colour of desk area meeting the target.")
  @widget(new ColorWidget())
  aboveColor: vec3 = new vec3(0.55, 0.95, 0.9)

  @input("vec3", "{0.8, 0.65, 1.0}")
  @hint("Colour of the head-shadow patch (light violet).")
  @widget(new ColorWidget())
  shadowColor: vec3 = new vec3(0.8, 0.65, 1.0)

  @input("vec3", "{1.0, 1.0, 1.0}")
  @hint("Colour of the target contour line.")
  @widget(new ColorWidget())
  contourColor: vec3 = new vec3(1, 1, 1)

  @input
  @hint("Overall heatmap opacity/brightness (0-1).")
  @widget(new SliderWidget(0.1, 1, 0.05))
  intensity: number = 0.55
  @ui.group_end

  private tex: Texture
  private provider: ProceduralTextureProvider
  private pixels: Uint8Array

  /** Build the quad on this SceneObject, width x depth cm, lying in local XZ at y=0. */
  build(widthCm: number, depthCm: number) {
    const mb = new MeshBuilder([
      {name: "position", components: 3},
      {name: "normal", components: 3},
      {name: "texture0", components: 2}
    ])
    mb.topology = MeshTopology.Triangles
    mb.indexType = MeshIndexType.UInt16
    const hw = widthCm / 2
    const hd = depthCm / 2
    // u along +x, v along -z (back edge = v 1)
    mb.appendVerticesInterleaved([
      -hw, 0, hd, 0, 1, 0, 0, 0,
      hw, 0, hd, 0, 1, 0, 1, 0,
      hw, 0, -hd, 0, 1, 0, 1, 1,
      -hw, 0, -hd, 0, 1, 0, 0, 1
    ])
    mb.appendIndices([0, 1, 2, 0, 2, 3])
    mb.updateMesh()
    const rmv = this.sceneObject.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    rmv.mesh = mb.getMesh()
    const mat = this.material.clone()
    rmv.mainMaterial = mat

    this.tex = ProceduralTextureProvider.createWithFormat(this.resolutionX, this.resolutionZ, TextureFormat.RGBA8Unorm)
    this.provider = this.tex.control as ProceduralTextureProvider
    this.pixels = new Uint8Array(this.resolutionX * this.resolutionZ * 4)
    mat.mainPass.baseTex = this.tex
    mat.mainPass.blendMode = BlendMode.Normal
    mat.mainPass.depthWrite = false
  }

  /**
   * Repaint. lux/blocked are row-major arrays [iz * resX + ix], iz=0 at the FRONT edge
   * (nearest the user), matching texture row 0 = v 0 = front.
   */
  paint(lux: Float32Array, blocked: Float32Array, target: number) {
    const W = this.resolutionX
    const H = this.resolutionZ
    const k = this.intensity
    const px = this.pixels
    for (let iz = 0; iz < H; iz++) {
      for (let ix = 0; ix < W; ix++) {
        const i = iz * W + ix
        const e = lux[i]
        const b = blocked[i]
        const above = e >= target
        let c: vec3
        let level: number
        if (b > 0.1 * (e + b) && b > 1) {
          c = this.shadowColor
          level = 0.95
        } else if (above) {
          c = this.aboveColor
          level = 0.45 + 0.55 * Math.min(1, (e - target) / target)
        } else {
          c = this.belowColor
          // never darker than 0.55 so it stays visible on additive display
          level = 0.55 + 0.35 * Math.min(1, e / target)
        }
        // contour: a neighbour on the other side of the target
        let contour = false
        if (ix + 1 < W && lux[i + 1] >= target !== above) contour = true
        else if (iz + 1 < H && lux[i + W] >= target !== above) contour = true
        if (contour) {
          c = this.contourColor
          level = 1
        }
        const a = contour ? 1 : k
        const o = i * 4
        px[o] = Math.round(255 * Math.min(1, c.x * level))
        px[o + 1] = Math.round(255 * Math.min(1, c.y * level))
        px[o + 2] = Math.round(255 * Math.min(1, c.z * level))
        px[o + 3] = Math.round(255 * a)
      }
    }
    this.provider.setPixels(0, 0, W, H, px)
  }
}
