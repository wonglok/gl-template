<template>
  <O3D v-if="screen">
    <O3D :pz="depth" :px="30 * (animator.value + hider.value)">
      <O3D :layout="'open-menu'">
        <TextureText :text="'Menu'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', 'menu') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="depth" v-if="isDev">
      <O3D :layout="'open-ui'">
        <TextureText :text="'UI Controls'" @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('/ui') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="depth">
      <O3D :layout="'brand-logo'">
        <TextureText :text="'Graphics Template'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', 'menu') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'pale2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="depth" :px="30 * (1.0 - animator.value)">
      <O3D :layout="'close-menu'">
        <TextureText :text="'CLOSE'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', '') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="hider.value * -depth * 2" :py="screen.height * (scroller.value)">
      <O3D :layout="'baller'">
        <O3D :pz="depth">
          <ParametricBaller :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-baller'" :kn="'parametric'"></ParametricBaller>
        </O3D>
      </O3D>
    </O3D>

    <O3D :pz="depth" :px="(1.0 - animator.value) * -screen.width">
      <O3D :visible="animator.value > 0.001">
        <RefractionArea :blur="animator.value * 0.96" v-if="base && screen" :screen="screen" :base="base" :color="'#aaaaaa'"></RefractionArea>
      </O3D>

      <O3D :layout="'menu-withloklok'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://withloklok.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'With Lok Lok'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-codelab'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://creativecodelab.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Creative Code Lab'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-effectnode'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://effectnode.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Effect Node'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-effectnode-2'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://v2.effectnode.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Node Based Three.js'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-igraph'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://igraph.effectnode.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'iGraph Cinematic Editor'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-wonglok'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://www.wonglok.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'WongLok . com'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>

      <O3D :layout="'menu-wonglok-age'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://age.wonglok.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Assisted Graphics Engineering'" :sdk="sdk" :base="base" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <slot></slot>
  </O3D>
</template>
<script>
import { Object3D } from 'three'
import { getScreen } from '../../ReusableGraphics/GetScreen'
import { Damper } from '../../ReusableGraphics/Damper.js'
import { castDownEvent } from '../../ReusableGraphics/Scope.js'

// const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    scroller: {},
    overlay: {},
    // animator: {},
    sdk: {},
    open: {},
    // screen: {},
    kn: {},
    base: {}
  },
  created () {
    this.$on('add', (v) => {
      this.o3d.add(v)
    })
    this.$on('remove', (v) => {
      this.o3d.remove(v)
    })
  },
  data () {
    return {
      isDev: process.env.NODE_ENV === 'development',
      hider: false,
      animator: false,
      stub: false,
      depth: 100,
      favouriteVerses: `Love is patient and kind;
love does not envy or boast;
It is not arrogant or rude.
It does not insist on its own way;
It is not irritable or resentful;
It does not rejoice at wrongdoing,
but rejoices with the truth.
Love bears all things,
believes all things,
hopes all things,
endures all things.
Love never ends.

1 Corinthians 13:4 - 8a`,
      screen: false,
      o3d: new Object3D()
    }
  },
  watch: {
  },
  methods: {
    onClick () {
      this.$emit('close')
    },
    openWin (href) {
      window.open(href)
    }
    // sync () {
    //   TWEEN.removeAll()
    //   if (this.open) {
    //     new TWEEN.Tween(this)
    //       .to({
    //         animator.value: 1
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   } else {
    //     new TWEEN.Tween(this)
    //       .to({
    //         animator.value: 0
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   }
    // }
  },
  async mounted () {
    this.animator = new Damper(0, this.base)
    this.hider = new Damper(0, this.base)
    this.sync = () => {
      if (this.overlay !== '') {
        this.hider.value = 1
      } else {
        this.hider.value = 0
      }
      if (this.overlay === 'menu') {
        this.animator.value = 1
      } else {
        this.animator.value = 0
      }
    }

    this.sync()
    this.$watch('overlay', this.sync)

    this.sdk.onStubGroup('menu-overlay', (stub) => {
      this.stub = stub
      castDownEvent(this, 'relayout', {})
    })

    const camera = await this.base.waitKN('camera')
    this.screen = getScreen({ camera, depth: this.depth })
    this.base.onResize(() => {
      this.screen = getScreen({ camera, depth: this.depth })
      castDownEvent(this, 'relayout', {})
    })
    // this.sync()
    this.$parent.$emit('add', this.o3d)
    if (this.base && this.kn) {
      this.base[this.kn] = this.o3d
    }
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.o3d)
  }
}
</script>
