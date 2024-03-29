<template>
  <div></div>
</template>

<script>
import { CylinderGeometry, Color, Vector2, InstancedBufferGeometry, BufferAttribute, InstancedBufferAttribute, RawShaderMaterial, Mesh, Object3D } from 'three'

/* eslint-disable */
export const tubeV = require('raw-loader!./tubeV.glsl').default
export const tubeF = require('raw-loader!./tubeF.glsl').default
/* eslint-enable */

export const createLineGeo = async ({ count = 100, numSides = 8, subdivisions = 50, openEnded = false }) => {
  // create a base CylinderGeometry which handles UVs, end caps and faces
  const radius = 1
  const length = 1
  const baseGeometry = new CylinderGeometry(radius, radius, length, numSides, subdivisions, openEnded)

  // fix the orientation so X can act as arc length
  baseGeometry.rotateZ(Math.PI / 2)

  // compute the radial angle for each position for later extrusion
  const tmpVec = new Vector2()
  const xPositions = []
  const angles = []
  const uvs = []
  const vertices = baseGeometry.vertices
  const faceVertexUvs = baseGeometry.faceVertexUvs[0]

  // Now go through each face and un-index the geometry.
  baseGeometry.faces.forEach((face, i) => {
    const { a, b, c } = face
    const v0 = vertices[a]
    const v1 = vertices[b]
    const v2 = vertices[c]
    const verts = [v0, v1, v2]
    const faceUvs = faceVertexUvs[i]

    // For each vertex in this face...
    verts.forEach((v, j) => {
      tmpVec.set(v.y, v.z).normalize()

      // the radial angle around the tube
      const angle = Math.atan2(tmpVec.y, tmpVec.x)
      angles.push(angle)

      // "arc length" in range [-0.5 .. 0.5]
      xPositions.push(v.x)

      // copy over the UV for this vertex
      uvs.push(faceUvs[j].toArray())
    })
  })

  // build typed arrays for our attributes
  const posArray = new Float32Array(xPositions)
  const angleArray = new Float32Array(angles)
  const uvArray = new Float32Array(uvs.length * 2)

  // unroll UVs
  for (var i = 0; i < posArray.length; i++) {
    const [u, v] = uvs[i]
    uvArray[i * 2 + 0] = u
    uvArray[i * 2 + 1] = v
  }

  const geometry = new InstancedBufferGeometry()
  geometry.maxInstancedCount = count
  geometry.setAttribute('position', new BufferAttribute(posArray, 1))
  geometry.setAttribute('angle', new BufferAttribute(angleArray, 1))
  geometry.setAttribute('uv', new BufferAttribute(uvArray, 2))

  const offsets = []

  for (let i = 0; i < count; i++) {
    const x = i / count
    const y = i
    const z = count
    offsets.push(
      x,
      y,
      z
    )
  }

  geometry.setAttribute('offset', new InstancedBufferAttribute(new Float32Array(offsets), 3))

  // dispose old geometry since we no longer need it
  baseGeometry.dispose()
  return geometry
}

export const makeParametric = async ({ ui, base, sdk, setting }) => {
  const count = 100
  const numSides = 50
  const subdivisions = 350
  const openEnded = false
  const geo = await createLineGeo({ count, numSides, subdivisions, openEnded })
  const glProxy = {
    add: (v) => {
      ui.$parent.$emit('add', v)
    },
    remove: (v) => {
      ui.$parent.$emit('remove', v)
    }
  }
  const group = sdk.getGroup(setting)
  const uniforms = {
    baseColor: { value: new Color('#fff') },
    thickness: { value: 0.01 },
    spread: { value: 0.01 },
    animateStrength: { value: 0.01 },
    animateRadius: { value: 0.01 },
    time: { value: 0 }
  }

  base.loop(() => {
    geo.maxInstancedCount = Math.floor(group.autoGet('maxLines') / 100.0 * count)

    uniforms.animateStrength.value = group.autoGet('animateStrength') / 100.0
    uniforms.animateRadius.value = group.autoGet('animateRadius') / 100.0

    uniforms.spread.value = group.autoGet('spread') / 10.0
    uniforms.thickness.value = group.autoGet('thickness') / 1000.0

    uniforms.baseColor.value = group.autoGet('base-color')
    uniforms.time.value = window.performance.now() * 0.001
  })

  const refresh = (mesh) => {
    const material = new RawShaderMaterial({
      defines: {
        lengthSegments: subdivisions.toFixed(1)
      },
      transparent: true,
      uniforms,
      vertexShader: tubeV,
      fragmentShader: tubeF
    })

    mesh.material = material
  }

  const mesh = new Mesh(geo, undefined, count)
  mesh.frustumCulled = false
  mesh.scale.set(20.0, 20.0, 20.0)
  refresh(mesh)

  const obj3d = new Object3D()
  obj3d.add(mesh)
  glProxy.add(obj3d)

  group.autoPulse('position', (v) => {
    obj3d.position.x = v.x - 50.0
    obj3d.position.y = v.y - 50.0
    obj3d.position.z = v.z - 50.0
  })

  console.log('parametric installed')
  const clean = async () => {
    // const mesh = await group.gets.kn)
    mesh.geometry.dispose()
    glProxy.remove(obj3d)
  }
  base.onClean(() => {
    clean()
  })
  return {
    clean
  }
}

export default {
  props: {
    base: {},
    sdk: {},
    setting: {
      default: 'parametric-1'
    }
  },
  data () {
    return {
      clean () {}
    }
  },
  async mounted () {
    const parametric = await makeParametric({ ui: this, base: this.base, sdk: this.sdk, setting: this.setting })
    this.clean = parametric.clean
  },
  beforeDestroy () {
    this.clean()
  }
}
</script>

<style>

</style>
