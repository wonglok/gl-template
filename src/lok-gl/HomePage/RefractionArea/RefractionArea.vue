<template>
  <div></div>
</template>
<script>
import { Refractor } from 'three/examples/jsm/objects/Refractor.js'
// import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js'
import { PlaneBufferGeometry, TextureLoader, Vector2 } from 'three'
import { BlurShader } from './LensBlurShader'
// import { getScreen } from '../../ReusableGraphics/GetScreen'
// import { getScreen } from '../../ReusableGraphics/GetScreen.js'

// export const visibleHeightAtZDepth = (depth, camera) => {
//   // compensate for cameras not positioned at z=0
//   const cameraOffset = camera.position.z
//   if (depth < cameraOffset) depth -= cameraOffset
//   else depth += cameraOffset

//   // vertical fov in radians
//   const vFOV = camera.fov * Math.PI / 180

//   // Math.abs to ensure the result is always positive
//   return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
// }

// export const visibleWidthAtZDepth = (depth, camera) => {
//   const height = visibleHeightAtZDepth(depth, camera)
//   return height * camera.aspect
// }

export default {
  props: {
    blur: {
      default: 0.9
    },
    // depth: {
    //   default: 0
    // },
    color: {
      default: 0x999999
    },
    kn: {},
    screen: {
      default: false
    },
    base: {}
  },
  watch: {
    screen () {
      this.$emit('resize')
    }
  },
  async mounted () {
    const base = this.base
    const camera = await base.waitKN('camera')
    // const texture = await base.waitKN(this.texture)
    const glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    const makeMesh = () => {
      const RES_SIZE = 512
      const screen = this.screen
      const geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
      const mesh = new Refractor(geo, {
        color: this.color,
        textureWidth: RES_SIZE,
        textureHeight: RES_SIZE * camera.aspect,
        shader: BlurShader
      })

      mesh.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/waterdudv.jpg'))
      mesh.material.uniforms['resolution'].value = new Vector2(RES_SIZE, RES_SIZE * camera.aspect)
      return mesh
    }

    let mesh = false
    base.loop(() => {
      if (!mesh) {
        return
      }
      mesh.material.uniforms['blur'].value = this.blur
      mesh.material.uniforms['time'].value = window.performance.now() * 0.001
    })
    const onRemake = () => {
      if (mesh) {
        glProxy.remove(mesh)
      }
      mesh = makeMesh()
      glProxy.add(mesh)
      base[this.kn] = mesh
    }
    this.$on('resize', onRemake)
    base.onResize(onRemake)
    this.$watch('color', onRemake, {
      deep: true,
      immediate: true
    })

    // glProxy.add(mesh)
    // console.log('done', this.kn)
  },
  async beforeDestroy () {
    const mesh = await this.base.waitKN(this.kn)
    this.glProxy.remove(mesh)
  }
}
</script>
