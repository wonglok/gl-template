<template>
  <div></div>
</template>

<script>
import { Color, Vector2 } from 'three'
export default {
  props: {
    sdk: {},
    base: {},
    kn: {},
    settings: {
      default: 'paint-canvas'
    },
    cubeTextureKN: {
      default: false
    },
    textureKN: {
      default: false
    }
  },
  async mounted () {
    const base = this.base
    const group = this.sdk.getGroup(this.settings)

    const easeOutSine = (t, b, c, d) => {
      return c * Math.sin((t / d) * (Math.PI / 2)) + b
    }

    const easeOutQuad = (t, b, c, d) => {
      t /= d
      return -c * t * (t - 2) + b
    }

    class TouchTexture {
      constructor () {
        this.size = 32
        this.width = 32
        this.height = 32
        this.width = this.height = this.size

        this.maxAge = 350
        this.radius = 0.1 * this.size
        // this.radius = 0.15 * 1000

        this.speed = 2.33 / this.maxAge
        // this.speed = 0.01

        this.trail = []
        this.last = null

        this.colorDot = new Color('#00C5CC')
        this.colorBG = new Color('#FFFFFF')
        this.hueSpread = 61.2 / 10

        try {
          group.autoPulse('canvas-texture-dot', (v) => {
            this.colorDot.copy(v)
          })
        } catch (e) {
          console.log(e)
        }
        try {
          group.autoPulse('hue-spread', (v) => {
            // console.log(v)
            this.hueSpread = v / 100
          })
        } catch (e) {
          console.log(e)
        }
        try {
          group.autoPulse('canvas-texture-bg', (v) => {
            this.colorBG.copy(v)
          })
        } catch (e) {
          console.log(e)
        }

        this.canvas = false
        this.initTexture()
      }

      get hueDot () {
        const hue = this.colorDot.getHSL(this.colorDot).h
        return (hue * 360).toFixed(0)
      }

      get satuationDot () {
        const satuation = this.colorDot.getHSL(this.colorDot).s
        return (satuation * 100).toFixed(0)
      }

      get lightnessDot () {
        const lightness = this.colorDot.getHSL(this.colorDot).l
        return (lightness * 100).toFixed(0)
      }

      initTexture () {
        this.canvas = document.createElement('canvas')

        this.canvas.width = this.width
        this.canvas.height = this.height
        this.ctx = this.canvas.getContext('2d')
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.canvas.id = 'touchTexture'
      }

      update (delta) {
        this.clear()
        const speed = this.speed
        this.trail.forEach((point, i) => {
          const f = point.force * speed * (1 - point.age / this.maxAge)
          // const x = point.x
          // const y = point.y

          point.x += point.vx * f
          point.y += point.vy * f
          point.age++
          if (point.age > this.maxAge) {
            this.trail.splice(i, 1)
          }
        })

        this.trail.forEach((point, i) => {
          this.drawPoint(point)
        })

        // this.drawPoints()

        // this.ctx.fillStyle = "rgba(255,0,0,0.5)"
        // this.ctx.fillRect(0, 0, 200, 200)
        // this.ctx.fillStyle = "rgba(0,255,0,0.5)"
        // this.ctx.fillRect(50, 0, 200, 200)
        // this.test()
      }

      clear () {
        // this.ctx.fillStyle = 'hsl(61, 100%, 100%)'
        // this.ctx.fillStyle = 'white'

        // this.ctx.fillStyle = '#' + this.colorDot.getHexString()

        this.ctx.fillStyle = '#' + this.colorBG.getHexString()

        // this.ctx.fillStyle = this.gradient
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      }

      addTouch (point) {
        var force = 0
        var vx = 0
        var vy = 0
        const last = this.last
        if (last) {
          const dx = point.x - last.x
          const dy = point.y - last.y
          if (dx === 0 && dy === 0) return
          const dd = dx * dx + dy * dy
          const d = Math.sqrt(dd)
          vx = dx / d
          vy = dy / d

          force = Math.min(dd * 10000, 1)
          // force = Math.sqrt(dd)* 50.
          // force = 1
        }
        this.last = {
          x: point.x,
          y: point.y
        }
        this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
      }

      drawPoint (point) {
        const ctx = this.ctx
        const pos = {
          x: point.x * this.width,
          y: (1 - point.y) * this.height
        }

        var intensity = 1

        if (point.age < this.maxAge * 0.3) {
          intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
        } else {
          intensity = easeOutQuad(
            1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
            0,
            1,
            1
          )
        }
        intensity *= point.force

        const radius = this.radius
        var color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) *
          255}, ${intensity * 255}`
        const variant = 100 * Number(this.hueSpread)

        color = `${(this.hueDot - variant / 2 + (intensity * (variant) * point.vx)).toFixed(0)}, ${this.satuationDot}%, ${this.lightnessDot}%`
        // color = `${(this.colorDot.getHSL(this.colorDot).h * 360).toFixed(0)}, 100%, 87%`

        const offset = this.size * 5
        ctx.shadowOffsetX = offset // (default 0)
        ctx.shadowOffsetY = offset // (default 0)
        ctx.shadowBlur = radius // (default 0)
        ctx.shadowColor = `hsla(${color},${0.4 * intensity})` // (default transparent black)

        this.ctx.beginPath()
        this.ctx.fillStyle = 'rgba(255,0,0,1)'
        this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }

    var mouse = new Vector2()
    const on = {
      onTouchStart (ev) {
        ev.preventDefault()
      },
      onTouchMove (ev) {
        ev.preventDefault()

        const touch = ev.targetTouches[0]

        mouse = {
          x: touch.clientX / window.innerWidth,
          y: 1 - touch.clientY / window.innerHeight
        }

        touchTextures.forEach(e => e.addTouch(mouse))
      },
      onMouseMove (ev) {
        mouse = {
          x: ev.clientX / window.innerWidth,
          y: 1 - ev.clientY / window.innerHeight
        }

        touchTextures.forEach(e => e.addTouch(mouse))
      }
    }

    const t = new TouchTexture()
    var touchTextures = [
      t
    ]

    // for (var i = 0; i < 10; i++) {
    //   t.addTouch({
    //     x: Math.random(),
    //     y: Math.random()
    //   })
    // }

    base.loop(() => {
      // if (Math.random() < 1) {
      //   t.addTouch({
      //     x: Math.random(),
      //     y: Math.random()
      //   })
      // }
      if (Math.random() < 0.95) {
        t.addTouch({
          x: Math.random(),
          y: Math.random()
        })
      }
      if (Math.random() < 0.95) {
        t.addTouch({
          x: Math.random(),
          y: Math.random()
        })
      }

      t.update()
      // cubeTexture.needsUpdate = true
    })

    const renderer = await base.waitKN('renderer')

    renderer.domElement.addEventListener('mousemove', on.onMouseMove, { passive: false })
    renderer.domElement.addEventListener('touchstart', on.onTouchStart, { passive: false })
    renderer.domElement.addEventListener('touchmove', on.onTouchMove, { passive: false })

    base[this.kn] = t.canvas
  }
}
</script>

<style>

</style>
